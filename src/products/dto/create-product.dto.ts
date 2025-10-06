import { Transform, Type } from 'class-transformer';
import { IsString, IsNumber, Min, IsOptional, IsArray } from 'class-validator';

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

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return undefined;

    // Case 1: JSON string like "[1,2,3]"
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((v) => Number(v));
        }
      } catch (e) {
        // Not a JSON string, fallback to comma-separated string
        return value.split(',').map((v) => Number(v.trim()));
      }
    }

    // Case 2: Already an array (from multiple form-data keys)
    if (Array.isArray(value)) {
      return value.map((v) => Number(v));
    }

    return [];
  }) //TODO: Only to test through postman
  @IsNumber({}, { each: true }) // validates each element
  categoryIds?: number[];
}