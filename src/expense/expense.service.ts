import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExpenseService {

    constructor(private readonly prisma: PrismaService) { }

    async createExpense(data: any,id:number) {
        // const user=await this.prisma.user.findUnique({
        //     where:{id},
        // });
        // if(!user){
        //     throw new Error('User not found');
        // }
        // return this.prisma.expense.create({
        //     data: {
        //         amount: data.amount,
        //         description: data.description,
        //         date: new Date(), 
        //         categoryId: data.categoryId,
        //         userId:user.id,
        //     },
        // });
        
        //no pre-query- let db handle the err of foreign key existence and we can catch it 
        try {
            return this.prisma.expense.create({
                data: {
                    amount: data.amount,
                    description: data.description,
                    date: new Date(data.date),
                    categoryId: data.categoryId,
                    userId: id,
                },
            })

        } catch (err: any) {
            throw new Error("Invalid user or category");
        }
    }

    async updateExpense(id:number,data:any){
        return this.prisma.expense.update({
            where:{id},
            data: {
                amount: data.amount,
                description: data.description,
                date: new Date(data.date),
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
