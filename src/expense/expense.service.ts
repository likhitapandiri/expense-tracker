import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExpenseService {

    constructor(private readonly prisma: PrismaService) { }

    async createExpense(data: any) {
        return this.prisma.expense.create({
            data: {
                amount: data.amount,
                description: data.description,
                date: new Date(), 
                categoryId: data.categoryId,
            },
        });
    }

    async getAllExpenses() {
        return this.prisma.expense.findMany({
            include: { category: true },
        });
    }

    async updateExpense(id:number,data:any){
        return this.prisma.expense.update({
            where:{id},
            data: {
                amount: data.amount,
                description: data.description,
                date: new Date(),
                categoryId: data.categoryId,
            },
        });
    }

    async deleteExpense(id:number){
        return this.prisma.expense.delete({
            where:{id},
        })
    }


}
