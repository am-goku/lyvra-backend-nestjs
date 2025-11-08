import { Transform, Type } from 'class-transformer';
import { IsString, IsNumber, Min, IsOptional, IsArray, IsUrl, IsNotEmpty, ValidateNested } from 'class-validator';

// Nested DTO for each image object in the imageData array
export class ImageDataDto {
  @IsUrl({}, { message: 'URL must be a valid URL' })
  @IsNotEmpty({ message: 'URL cannot be empty' })
  url: string;

  @IsString({ message: 'Asset ID must be a string' })
  @IsNotEmpty({ message: 'Asset ID cannot be empty' })
  asset_id: string;

  @IsString({ message: 'Public ID must be a string' })
  @IsNotEmpty({ message: 'Public ID cannot be empty' })
  public_id: string;
}

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
  @IsArray({ message: 'imageData must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ImageDataDto)
  imageData?: ImageDataDto[];

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
