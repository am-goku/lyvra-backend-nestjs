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
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @UseInterceptors(FilesInterceptor('images'))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Create a new product (Admin only)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'iPhone 16 Pro' },
                description: { type: 'string', example: 'Flagship smartphone from Apple' },
                price: { type: 'number', example: 1299 },
                categoryIds: {
                    type: 'array',
                    items: { type: 'number' },
                    example: [1, 2],
                },
                images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                },
            },
            required: ['name', 'price'],
        },
    })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    async create(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() dto: CreateProductDto,
        @Req() req,
    ) {
        let imageUrls: string[] = [];

        if (files && files.length) {
            // 🧪 Mock Cloudinary upload (replace later)
            imageUrls = files.map(
                (file, idx) => `https://mock.cloudinary.com/product_${Date.now()}_${idx}.jpg`,
            );
        }

        return this.productsService.create({ ...dto, imageUrls }, req.user.userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products (optionally filter by category IDs)' })
    @ApiQuery({
        name: 'categoryIds',
        required: false,
        type: String,
        example: '1,2,3',
        description: 'Comma-separated category IDs',
    })
    @ApiResponse({ status: 200, description: 'List of products returned successfully' })
    findAll(@Query('categoryIds') categoryIds: string) {
        const ids = categoryIds ? categoryIds.split(',').map((id) => +id) : undefined;
        return this.productsService.findAll(ids);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single product by ID' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an existing product (Admin only)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a product by ID (Admin only)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}
