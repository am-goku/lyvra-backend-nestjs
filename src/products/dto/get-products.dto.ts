import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SortBy {
    PRICE_ASC = 'price_asc',
    PRICE_DESC = 'price_desc',
    NEWEST = 'newest',
    OLDEST = 'oldest',
    NAME_ASC = 'name_asc', // Added for completeness
    NAME_DESC = 'name_desc'
}

export class GetProductsDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    categoryIds?: string; // Comma-separated IDs

    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    limit?: number = 20;
}
