import { Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getExpenseBetweenDates(
        id: number,
        startDate: Date,
        endDate: Date,
    ) {
        return this.prisma.transaction.findMany({
            where: {
                userId: id,
                type: TransactionType.EXPENSE,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
    }

    async getExpenseSumByUser(id: number) {
        const result = await this.prisma.transaction.aggregate({
            where: {
                userId: id,
                type: TransactionType.EXPENSE,
            },
            _sum: {
                amount: true,
            },
        });

        return {
            total: result._sum.amount ?? new Prisma.Decimal(0),
        };
    }

    async getExpensesByCategory(id: number) {
        const result = await this.prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                userId: id,
                type: TransactionType.EXPENSE,
            },
            _sum: {
                amount: true,
            },
        });

        return result.map((item) => ({
            categoryId: item.categoryId,
            total: item._sum.amount ?? new Prisma.Decimal(0),
        }));
    }
}
