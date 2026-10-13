import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/request-user.type';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
    constructor(
        private readonly expensesService: ExpensesService,
    ) { }

    @Post()
    create(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateExpenseDto,
    ) {
        return this.expensesService.create(user.id, dto);
    }

    @Get()
    findAll(
        @CurrentUser() user: AuthUser,
        @Query() query: QueryExpensesDto,
    ) {

        return this.expensesService.findAll(user.id, query);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.expensesService.findOne(user.id, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateExpenseDto,
    ) {
        return this.expensesService.update(user.id, id, dto);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.expensesService.remove(user.id, id);
    }
}