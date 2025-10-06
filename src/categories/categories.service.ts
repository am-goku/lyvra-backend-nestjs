import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { };

    create(dto: CreateCategoryDto) {
        return this.prisma.category.create({ data: dto })
    }

    findAll() {
        return this.prisma.category.findMany({
            include: { products: true }
        });
    }

    findOne(id: number) {
        return this.prisma.category.findUnique({ where: { id } });
    }

    remove(id: number) {
        return this.prisma.category.delete({ where: { id } });
    }
}
