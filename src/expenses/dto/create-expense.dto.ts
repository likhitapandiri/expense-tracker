
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: 'amount must be a positive monetary value with up to 2 decimal places',
    })
    amount: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsDateString()
    date: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId: number;
}
