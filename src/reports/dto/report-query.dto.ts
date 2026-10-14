import { Type } from 'class-transformer';
import {
    IsDateString,
    IsInt,
    IsOptional,
    Max,
    Min,
} from 'class-validator';

export class ReportQueryDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class MonthlyReportQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    year?: number;
}