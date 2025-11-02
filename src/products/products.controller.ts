import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateProductDto,
        @Req() req
    ) {
        let imageUrl: string | undefined;

        if (file) {
            const uploaded = await this.cloudinaryService.uploadImage(file);
            imageUrl = uploaded.secure_url;
        }

        return this.productsService.create({ ...dto, imageUrl }, req.user.userId);
    }

    @Get()
    findAll(@Query('categoryIds') categoryIds: string) {
        const ids = categoryIds ? categoryIds.split(',').map(id => +id) : undefined;
        return this.productsService.findAll(ids);
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
