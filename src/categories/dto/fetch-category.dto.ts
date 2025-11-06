import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// DTO for query parameters
export class FindAllCategoriesDto {
    @ApiPropertyOptional({
        description: 'Number of records to skip for pagination (default: 0)',
        type: Number,
        default: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    skip?: number = 0;

    @ApiPropertyOptional({
        description: 'Number of records to take per page (default: 20)',
        type: Number,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    take?: number = 20;

    @ApiPropertyOptional({
        description: 'Search term to filter categories',
        type: String,
    })
    @IsOptional()
    @IsString()
    search?: string;
}