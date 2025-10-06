import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  providers: [ProductsService, CloudinaryService],
  controllers: [ProductsController]
})
export class ProductsModule {}
