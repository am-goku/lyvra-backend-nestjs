import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsArray, IsOptional, IsInt } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({
    example: [4, 5],
    required: false,
    description: 'Product IDs to add to this category',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  addProductIds?: number[];

  @ApiProperty({
    example: [2],
    required: false,
    description: 'Product IDs to remove from this category',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  removeProductIds?: number[];
}
