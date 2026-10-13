import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/request-user.type';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    @Get('me')
    getMe(@CurrentUser() user: AuthUser) {
        return user;
    }
}
