
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const defaultCategories = [
        'food',
        'transport',
        'shopping',
        'bills',
        'health',
        'entertainment',
    ];

    for (const name of defaultCategories) {
        const existing = await prisma.category.findFirst({
            where: {
                name,
                userId: null,
                isDefault: true,
            },
            select: { id: true },
        });

        if (!existing) {
            await prisma.category.create({
                data: {
                    name,
                    userId: null,
                    isDefault: true,
                },
            });
        }
    }

    console.log('Default categories seeded successfully');
}

main()
    .catch((error) => {
        console.error('Error seeding default categories:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


//Seeding is a one-time database setup task.