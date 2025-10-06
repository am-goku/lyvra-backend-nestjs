import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    create(dto: CreateProductDto, userId: number) {
        return this.prisma.product.create({
            data: { ...dto, createdBy: userId }
        })
    }

    findAll() {
        return this.prisma.product.findMany({
            include: { user: { select: { id: true, email: true } } }
        })
    }

    findOne(id: number) {
        return this.prisma.product.findUnique({ where: { id } });
    }

    update(id: number, dto: UpdateProductDto) {
        return this.prisma.product.update({ where: { id }, data: dto });
    }

    remove(id: number) {
        return this.prisma.product.delete({ where: { id } });
    }
}
