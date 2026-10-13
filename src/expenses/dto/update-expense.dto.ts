
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

export class UpdateExpenseDto {
    @IsOptional()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: 'amount must be a positive monetary value with up to 2 decimal places',
    })
    amount?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string | null;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId?: number;
}
