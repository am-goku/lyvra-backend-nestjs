import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { GetProductsDto } from './dto/get-products.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @UseInterceptors(FilesInterceptor('images'))
    async create(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() dto: CreateProductDto,
        @Req() req,
    ) {
        let imageData: { url: string, asset_id: string, public_id: string }[] = [];

        if (files && files.length) {
            imageData = await this.cloudinaryService.uploadImages(files)
        }

        return this.productsService.create({ ...dto, imageData }, req.user.userId);
    }

    @Get()
    findAll(@Query(ValidationPipe) query: GetProductsDto) {
        return this.productsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}
