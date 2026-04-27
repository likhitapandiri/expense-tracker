import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    create(@Body() body) {
        return this.userService.createUser(body);
    }

    @Get()
    getUserByEmail(@Query('email') email: string) {
        if (!email) {
            throw new Error('Email is required');
        }
        return this.userService.getUserByEmail(email);
    }

    //get user with expenses-- user+expenses
    @Get(':id')
    getUserExpense(@Param('id') id:string){
        return this.userService.getUserExpenses(Number(id));
    }

    //get expenses by user-- only expenses
    @Get('expense/:id')
    getExpensesByUser(@Param('id') id: string) {
        return this.userService.getExpensesByUser(Number(id));
    }
}
