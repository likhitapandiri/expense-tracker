import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IndexLearningService {
    constructor(private readonly prisma: PrismaService) { }
    
    async addBulkExpenses(userId : number){
        const expenses: Prisma.ExpenseCreateManyInput[]  =[];
        for(let i=0;i<10000;i++){
           expenses.push({
            amount:Math.floor(Math.random())*1000,
            description:`Expense ${i}`,
            date:new Date(),
            categoryId: Math.floor(Math.random() * 5) + 1,
            userId:userId

           });
        }

        await this.prisma.expense.createMany({
            data:expenses,
        });

    }
}
  