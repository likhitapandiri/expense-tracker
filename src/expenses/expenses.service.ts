
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';

@Injectable()
export class ExpensesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly categoriesService: CategoriesService,
    ) { }

    async create(userId: number, dto: CreateExpenseDto) {
        const amount = new Prisma.Decimal(dto.amount);

        if (amount.lte(0)) {
            throw new BadRequestException(
                'Amount must be greater than zero',
            );
        }

        await this.categoriesService.validateCategoryForUser(
            userId,
            dto.categoryId,
        );

        return this.prisma.transaction.create({
            data: {
                type: TransactionType.EXPENSE,
                amount,
                description: dto.description?.trim() || null,
                date: new Date(dto.date),
                userId,
                categoryId: dto.categoryId,
            },
            select: {
                id: true,
                type: true,
                amount: true,
                description: true,
                date: true,
                categoryId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findAll(userId: number, query: QueryExpensesDto) {
        const {
            startDate,
            endDate,
            minAmount,
            maxAmount,
            sortBy = 'date',
            sortOrder = 'desc',
        } = query;

        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 10);

        const categoryId =
            query.categoryId !== undefined
                ? Number(query.categoryId)
                : undefined;

        if (limit > 100) {
            throw new BadRequestException(
                'Limit cannot exceed 100',
            );
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            throw new BadRequestException(
                'startDate must be before or equal to endDate',
            );
        }

        if (
            minAmount !== undefined &&
            maxAmount !== undefined &&
            new Prisma.Decimal(minAmount).gt(
                new Prisma.Decimal(maxAmount),
            )
        ) {
            throw new BadRequestException(
                'minAmount cannot exceed maxAmount',
            );
        }

        const dateFilter: Prisma.DateTimeFilter = {};

        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }

        if (endDate) {
            const end = new Date(endDate);

            // Include the entire day for YYYY-MM-DD inputs.
            if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
                end.setUTCHours(23, 59, 59, 999);
            }

            dateFilter.lte = end;
        }

        const where: Prisma.TransactionWhereInput = {
            userId,
            type: TransactionType.EXPENSE,
            ...(categoryId !== undefined ? { categoryId } : {}),
            ...(startDate || endDate ? { date: dateFilter } : {}),
            ...(minAmount !== undefined || maxAmount !== undefined
                ? {
                    amount: {
                        ...(minAmount !== undefined
                            ? { gte: new Prisma.Decimal(minAmount) }
                            : {}),
                        ...(maxAmount !== undefined
                            ? { lte: new Prisma.Decimal(maxAmount) }
                            : {}),
                    },
                }
                : {}),
        };

        const skip = (page - 1) * limit;

        const [expenses, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { [sortBy]: sortOrder },
                    { id: 'desc' },
                ],
                select: {
                    id: true,
                    type: true,
                    amount: true,
                    description: true,
                    date: true,
                    categoryId: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    createdAt: true,
                    updatedAt: true,
                },
            }),

            this.prisma.transaction.count({ where }),
        ]);

        return {
            data: expenses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(userId: number, expenseId: number) {
        const expense = await this.prisma.transaction.findFirst({
            where: {
                id: expenseId,
                userId,
                type: TransactionType.EXPENSE,
            },
            select: {
                id: true,
                type: true,
                amount: true,
                description: true,
                date: true,
                categoryId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!expense) {
            throw new NotFoundException('Expense not found');
        }

        return expense;
    }

    async update(
        userId: number,
        expenseId: number,
        dto: UpdateExpenseDto,
    ) {
        // Verify that this is the user's expense, not an income transaction.
        await this.findOne(userId, expenseId);

        const data: Prisma.TransactionUncheckedUpdateInput = {};

        if (dto.amount !== undefined) {
            const amount = new Prisma.Decimal(dto.amount);

            if (amount.lte(0)) {
                throw new BadRequestException(
                    'Amount must be greater than zero',
                );
            }

            data.amount = amount;
        }

        if (dto.description !== undefined) {
            data.description = dto.description?.trim() || null;
        }

        if (dto.date !== undefined) {
            data.date = new Date(dto.date);
        }

        if (dto.categoryId !== undefined) {
            await this.categoriesService.validateCategoryForUser(
                userId,
                dto.categoryId,
            );

            data.categoryId = dto.categoryId;
        }

        // updateMany lets us enforce ownership and transaction type
        // in the write itself, avoiding an ownership race between reads.
        const result = await this.prisma.transaction.updateMany({
            where: {
                id: expenseId,
                userId,
                type: TransactionType.EXPENSE,
            },
            data,
        });

        if (result.count === 0) {
            throw new NotFoundException('Expense not found');
        }

        return this.findOne(userId, expenseId);
    }

    async remove(userId: number, expenseId: number) {
        const result = await this.prisma.transaction.deleteMany({
            where: {
                id: expenseId,
                userId,
                type: TransactionType.EXPENSE,
            },
        });

        if (result.count === 0) {
            throw new NotFoundException('Expense not found');
        }

        return {
            message: 'Expense deleted successfully',
        };
    }
}
