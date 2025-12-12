import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

// DTO for query parameters
export class FindAllCategoriesDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    skip?: number = 0;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    take?: number = 20;

    @IsOptional()
    @IsString()
    search?: string;
}