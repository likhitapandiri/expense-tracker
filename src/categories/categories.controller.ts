
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/request-user.type';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService,
    ) { }

    @Get()
    findAll(@CurrentUser() user: AuthUser) {
        return this.categoriesService.findAll(user.id);
    }

    @Post()
    create(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateCategoryDto,
    ) {
        return this.categoriesService.create(user.id, dto);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(user.id, id, dto);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.categoriesService.remove(user.id, id);
    }
}
