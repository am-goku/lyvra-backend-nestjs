import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsArray, IsOptional, IsInt } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  addProductIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  removeProductIds?: number[];
}
