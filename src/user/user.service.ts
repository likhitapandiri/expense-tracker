import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    // async createUser(data: any) {
    //  return this.prisma.user.create({ data })
    // }

    async createUser(data: any) {
        return this.prisma.user.upsert({
            where:{
                email:data.email,
            },
            update:{},
            create:{
                name:data.name,
                email:data.email
            }
        })
    }

    async getUserByEmail(email:string){
        return this.prisma.user.findUnique({
            where:{email}
        })
    }

    async getUserExpenses(id:number){
       return this.prisma.user.findMany({
        where:{id},
        include:{expenses:true},
       })
    }

    async getExpensesByUser(id:number){
       return this.prisma.expense.findMany({
        where:{userId:id},
       })
    }


}
