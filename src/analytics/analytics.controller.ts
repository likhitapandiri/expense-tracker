import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) {}

    //Filter API
    @Get('filter/:id')
    getExpenseBetweenDates(@Param('id') id: string,@Query('startDate') startDate: string,@Query('endDate') endDate:string){
        if(!startDate || !endDate){
            throw new BadRequestException("startDate and endDate both are required");
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestException("Invalid date format");
        }

        if (start >= end) {
            throw new BadRequestException("startDate must be less than endDate");
        }

        return this.analyticsService.getExpenseBetweenDates(Number(id),start,end)
        
    }

    //aggregation api 
    @Get('aggregate/:id')
    getExpenseSumByUser(@Param('id') id:string){
        return this.analyticsService.getExpenseSumByUser(Number(id));
    }

    //group by
    @Get('groupBy/:id')
    getExpensesByCategory(@Param('id') id: string) {
        return this.analyticsService.getExpensesByCategory(Number(id));
    }

    
}
