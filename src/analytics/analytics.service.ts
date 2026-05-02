import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }
    
    async getExpenseBetweenDates(id:number,startDate:Date,endDate:Date){
        return this.prisma.expense.findMany({
            where:{
                userId:id,
                date:{
                    gte: startDate,
                    lte: endDate,
                }
            }
        })
    }

    async getExpenseSumByUser(id:number){
        const result = await this.prisma.expense.aggregate({
            where:{
                userId:id,
            },
            _sum:{
                amount:true,
            }
        });
        return {
            total:result._sum.amount??0
        }
    }

    async getExpensesByCategory(id:number){
        const result = await this.prisma.expense.groupBy({
            by:['categoryId'],
            where:{
                userId:id,
            },
            _sum:{
                amount:true,
            }

        });

        return result.map(item =>({
            
                categoryId: item.categoryId,
                total: item._sum.amount ?? 0,
        }));
    }
}
