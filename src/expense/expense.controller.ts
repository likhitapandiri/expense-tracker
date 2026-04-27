import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ExpenseService } from './expense.service';

@Controller('expense')
export class ExpenseController {
    constructor(private readonly expenseService : ExpenseService) {}


    @Post(':id')
    create(@Body() body,@Param('id')id:string){
        return this.expenseService.createExpense(body,Number(id));
    }

    @Put(':id')
    update(@Param('id') id:string,@Body() body){
        return this.expenseService.updateExpense(Number(id),body);
    }

    @Delete(':id')
    delete(@Param('id') id:string){
        return this.expenseService.deleteExpense(Number(id));
    }
}
