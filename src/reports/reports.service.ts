import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from 'generated/prisma/internal/prismaNamespace';
import { use } from 'passport';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

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

    // Overall summary
    async getSummary(
        userId: number,
        startDate?: string,
        endDate?: string,
    ) {
        const date = this.buildDateFilter(startDate, endDate);

        const result = await this.prisma.expense.aggregate({
            where: {
                userId,
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

    // Spending grouped by category
    async getCategoryBreakdown(
        userId: number,
        startDate?: string,
        endDate?: string,
    ) {
        const date = this.buildDateFilter(startDate, endDate);

        const groupedExpenses = await this.prisma.expense.groupBy({
            by: ['categoryId'],
            where: {
                userId,
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

        // Fetch the names for the category IDs returned by groupBy().
        const categories = await this.prisma.category.findMany({
            where: {
                id: {
                    in: groupedExpenses.map((item) => item.categoryId),
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        const categoryNames = new Map(
            categories.map((category) => [
                category.id,
                category.name,
            ]),
        );

        return groupedExpenses.map((item) => ({
            categoryId: item.categoryId,
            categoryName:
                categoryNames.get(item.categoryId) ?? 'Unknown',
            totalSpent:
                item._sum.amount ?? new Prisma.Decimal(0),
            expenseCount: item._count._all,
        }));
    }

    // Monthly spending for a given year
    async getMonthlyReport(
        userId: number,
        year = new Date().getUTCFullYear(),
    ) {
        const startDate = new Date(Date.UTC(year, 0, 1));
        const endDate = new Date(Date.UTC(year + 1, 0, 1));

        // Prisma groupBy() does not directly group DateTime
        // values by calendar month. Use parameterized SQL here.
        const rows = await this.prisma.$queryRaw<
            {
                month: number;
                totalSpent: Decimal | null;
                expenseCount: bigint;
            }[]
        >(Prisma.sql`
      SELECT
        MONTH(date) AS month,
        SUM(amount) AS totalSpent,
        COUNT(*) AS expenseCount
      FROM Expense
      WHERE userId = ${userId}
        AND date >= ${startDate}
        AND date < ${endDate}
      GROUP BY MONTH(date)
      ORDER BY MONTH(date)
    `);

        return rows.map((row) => ({
            month: row.month,
            totalSpent:
                row.totalSpent ?? new Prisma.Decimal(0),
            expenseCount: Number(row.expenseCount),
        }));
    }

    // Dashboard
    async getDashboard(userId: number) {
        const now = new Date();

        // Current calendar month, using UTC boundaries.
        const startDate = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                1,
            ),
        );

        const endDate = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth() + 1,
                1,
            ),
        );

        const [summary, categories, recentExpenses] =
            await Promise.all([
                this.getSummary(
                    userId,
                    startDate.toISOString(),
                    endDate.toISOString(),
                ),

                this.getCategoryBreakdown(
                    userId,
                    startDate.toISOString(),
                    endDate.toISOString(),
                ),

                this.prisma.expense.findMany({
                    where: { userId },
                    orderBy: [
                        { date: 'desc' },
                        { id: 'desc' },
                    ],
                    take: 5,
                    select: {
                        id: true,
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