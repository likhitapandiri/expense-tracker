
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(userId: number) {
        return this.prisma.category.findMany({
            where:{
                OR:[
                    {userId},
                    {userId:null , isDefault:true},
                ]
            },
            select: {
                id: true,
                name: true,
                isDefault: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    async create(userId: number, dto: CreateCategoryDto) {
        const name = this.normalizeCategoryName(dto.name);

        if (!name) {
            throw new BadRequestException('Category name cannot be empty');
        }

        await this.ensureCategoryNameAvailable(userId, name);

        try {
            return await this.prisma.category.create({
                data: {
                    name,
                    userId,
                    isDefault: false,
                },
                select: {
                    id: true,
                    name: true,
                    isDefault: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    'A category with this name already exists',
                );
            }

            throw error;
        }
    }

    async update(
        userId: number,
        categoryId: number,
        dto: UpdateCategoryDto,
    ) {
        const name = this.normalizeCategoryName(dto.name);

        if (!name) {
            throw new BadRequestException('Category name cannot be empty');
        }

        const category = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
                userId,
                isDefault: false,
            },
            select: { id: true },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        await this.ensureCategoryNameAvailable(
            userId,
            name,
            categoryId,
        );

        try {
            return await this.prisma.category.update({
                where: { id: categoryId },
                data: { name },
                select: {
                    id: true,
                    name: true,
                    isDefault: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    'A category with this name already exists',
                );
            }

            throw error;
        }
    }

    async remove(userId: number, categoryId: number) {
        const category = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
                userId,
                isDefault: false,
            },
            select: {
                id: true,
                _count: {
                    select: {
                        expenses: true,
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (category._count.expenses > 0) {
            throw new BadRequestException(
                'Cannot delete a category that is used by expenses',
            );
        }

        try {
            await this.prisma.category.delete({
                where: { id: category.id },
            });
        } catch (error) {
            // An expense might reference this category if one was
            // created after the count check.
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003'
            ) {
                throw new BadRequestException(
                    'Cannot delete a category that is used by expenses',
                );
            }

            throw error;
        }

        return { message: 'Category deleted successfully' };
    }

    private normalizeCategoryName(name: string): string {
        return name.trim().toLowerCase();
    }

    private async ensureCategoryNameAvailable(
        userId: number,
        name: string,
        excludeCategoryId?: number,
    ): Promise<void> {
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                name,
                OR: [
                    { userId },
                    { userId: null, isDefault: true },
                ],
                ...(excludeCategoryId !== undefined
                    ? { id: { not: excludeCategoryId } }
                    : {}),
            },
            select: { id: true },
        });

        if (existingCategory) {
            throw new ConflictException(
                'A category with this name already exists',
            );
        }
    }
}
