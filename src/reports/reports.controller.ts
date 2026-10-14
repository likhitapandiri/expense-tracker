import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';

import { ReportsService } from './reports.service';


import {
    MonthlyReportQueryDto,
    ReportQueryDto,
} from './dto/report-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/request-user.type';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
    ) { }

    @Get('summary')
    getSummary(
        @CurrentUser() user: AuthUser,
        @Query() query: ReportQueryDto,
    ) {
        return this.reportsService.getSummary(
            user.id,
            query.startDate,
            query.endDate,
        );
    }

    @Get('categories')
    getCategoryBreakdown(
        @CurrentUser() user: AuthUser,
        @Query() query: ReportQueryDto,
    ) {
        return this.reportsService.getCategoryBreakdown(
            user.id,
            query.startDate,
            query.endDate,
        );
    }

    @Get('monthly')
    getMonthlyReport(
        @CurrentUser() user: AuthUser,
        @Query() query: MonthlyReportQueryDto,
    ) {
        return this.reportsService.getMonthlyReport(
            user.id,
            query.year,
        );
    }

    @Get('dashboard')
    getDashboard(
        @CurrentUser() user: AuthUser,
    ) {
        return this.reportsService.getDashboard(user.id);
    }
}