import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() dto: CreateProductDto, @Req() req) {
        return this.productsService.create(dto, req.user.userId);
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id:number) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto){
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}
