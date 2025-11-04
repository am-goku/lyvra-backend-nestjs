import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new category (Admin only)' })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all categories (supports pagination & search)',
    })
    findAll(
        @Query('skip') skip?: number,
        @Query('take') take?: number,
        @Query('search') search?: string,
    ) {
        return this.categoriesService.findAll({
            skip: skip ? +skip : 0,
            take: take ? +take : 20,
            search,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get category by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.findOne(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update a category and manage product associations (Admin only)',
    })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Soft delete a category (Admin only)',
    })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.remove(id);
    }

    @Get('count/all')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Count all active categories (Admin only)' })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    count() {
        return this.categoriesService.count();
    }
}
