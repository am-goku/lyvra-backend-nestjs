import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Devices, gadgets, and accessories',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    example: [1, 2, 3],
    required: false,
    description: 'IDs of existing products to link',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  productIds?: number[];
}
