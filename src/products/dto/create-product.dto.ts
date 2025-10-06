import { Type } from 'class-transformer';
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  price: number;

  @IsOptional()
  imageUrl?: string
}