import { Transform, Type } from 'class-transformer';
import { IsString, IsNumber, Min, IsOptional, IsArray, IsUrl } from 'class-validator';

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
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map(Number);
      } catch {
        return value.split(',').map((v) => Number(v.trim()));
      }
    }
    if (Array.isArray(value)) return value.map(Number);
    return [];
  })
  categoryIds?: number[];
}
