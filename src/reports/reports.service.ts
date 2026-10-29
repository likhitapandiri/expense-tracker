import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    private buildDateFilter(
        startDate?: string,
        endDate?: string,
    ): Prisma.DateTimeFilter | undefined {
        const filter: Prisma.DateTimeFilter = {};

        if (startDate) {
            filter.gte = new Date(startDate);
        }

        if (endDate) {
            const end = new Date(endDate);

            // Make a date-only endDate inclusive by using
            // the start of the following day as an exclusive bound.
            if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
                end.setUTCHours(0, 0, 0, 0);
                end.setUTCDate(end.getUTCDate() + 1);
            }

            filter.lt = end;
        }

        if (
            startDate &&
            endDate &&
            new Date(startDate) >= (
                /^\d{4}-\d{2}-\d{2}$/.test(endDate)
                    ? (() => {
                        const end = new Date(endDate);
                        end.setUTCDate(end.getUTCDate() + 1);
                        return end;
                    })()
                    : new Date(endDate)
            )
        ) {
            throw new BadRequestException(
                'startDate must be before endDate',
            );
        }

        return Object.keys(filter).length ? filter : undefined;
    }

    // Overall expense summary
    async getSummary(
        userId: number,
        startDate?: string,
        endDate?: string,
    ) {
        const date = this.buildDateFilter(startDate, endDate);

        const result = await this.prisma.transaction.aggregate({
            where: {
                userId,
                type: TransactionType.EXPENSE,
                ...(date ? { date } : {}),
            },
            _sum: {
                amount: true,
            },
            _count: {
                _all: true,
            },
            _avg: {
                amount: true,
            },
        });

        return {
            totalSpent:
                result._sum.amount ?? new Prisma.Decimal(0),
            expenseCount: result._count._all,
            avgExpense:
                result._avg.amount ?? new Prisma.Decimal(0),
        };
    }

    // Expense breakdown by category
    async getCategoryBreakdown(
        userId: number,
        startDate?: string,
        endDate?: string,
    ) {
        const date = this.buildDateFilter(startDate, endDate);

        const groupedExpenses = await this.prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                userId,
                type: TransactionType.EXPENSE,
                ...(date ? { date } : {}),
            },
            _sum: {
                amount: true,
            },
            _count: {
                _all: true,
            },
            orderBy: {
                categoryId: 'asc',
            },
        });

        if (groupedExpenses.length === 0) {
            return [];
        }

        const categoryIds = groupedExpenses
            .map((item) => item.categoryId)
            .filter((id): id is number => id !== null);

        const categories = await this.prisma.category.findMany({
            where: {
                id: { in: categoryIds },
            },
            select: {
                id: true,
                name: true,
            },
        });

        const categoryNames = new Map(
            categories.map((category) => [category.id, category.name]),
        );

        return groupedExpenses.map((item) => ({
            categoryId: item.categoryId,
            categoryName: item.categoryId
                ? categoryNames.get(item.categoryId) ?? 'Unknown'
                : 'Uncategorized',
            totalSpent: item._sum.amount ?? new Prisma.Decimal(0),
            expenseCount: item._count._all,
        }));
    }

    // Monthly expense report for a given year
    async getMonthlyReport(
        userId: number,
        year = new Date().getUTCFullYear(),
    ) {
        if (!Number.isInteger(year) || year < 1000 || year > 9999) {
            throw new BadRequestException('Invalid year');
        }

        const startDate = new Date(Date.UTC(year, 0, 1));
        const endDate = new Date(Date.UTC(year + 1, 0, 1));

        const rows = await this.prisma.$queryRaw<
            {
                month: number;
                totalSpent: Prisma.Decimal | null;
                expenseCount: bigint;
            }[]
        >(Prisma.sql`
      SELECT
        MONTH(date) AS month,
        SUM(amount) AS totalSpent,
        COUNT(*) AS expenseCount
      FROM \`Transaction\`
      WHERE userId = ${userId}
        AND type = ${TransactionType.EXPENSE}
        AND date >= ${startDate}
        AND date < ${endDate}
      GROUP BY MONTH(date)
      ORDER BY MONTH(date)
    `);

        return rows.map((row) => ({
            month: row.month,
            totalSpent: row.totalSpent ?? new Prisma.Decimal(0),
            expenseCount: Number(row.expenseCount),
        }));
    }

    // Dashboard for the current UTC calendar month
    async getDashboard(userId: number) {
        const now = new Date();

        const startDate = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
        );

        const endDate = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
        );

        const start = startDate.toISOString();
        const end = endDate.toISOString();

        const [summary, categories, recentExpenses] = await Promise.all([
            this.getSummary(userId, start, end),
            this.getCategoryBreakdown(userId, start, end),

            this.prisma.transaction.findMany({
                where: {
                    userId,
                    type: TransactionType.EXPENSE,
                },
                orderBy: [
                    { date: 'desc' },
                    { id: 'desc' },
                ],
                take: 5,
                select: {
                    id: true,
                    type: true,
                    amount: true,
                    description: true,
                    date: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
        ]);

        return {
            summary,
            categories,
            recentExpenses,
        };
    }
}
