import { Type } from 'class-transformer';
import {
    IsDateString,
    IsIn,
    IsInt,
    IsOptional,
    Matches,
    Min,
    Max,
} from 'class-validator';

export class QueryExpensesDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit = 10;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId?: number;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @Matches(/^\d+(\.\d{1,2})?$/)
    minAmount?: string;

    @IsOptional()
    @Matches(/^\d+(\.\d{1,2})?$/)
    maxAmount?: string;

    @IsOptional()
    @IsIn(['date', 'amount', 'createdAt'])
    sortBy: 'date' | 'amount' | 'createdAt' = 'date';

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder: 'asc' | 'desc' = 'desc';
}