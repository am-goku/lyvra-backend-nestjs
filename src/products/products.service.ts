import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto, userId: number) {
    const { categoryIds, imageUrls, ...rest } = dto;

    return this.prisma.product.create({
      data: {
        ...rest,
        createdBy: userId,
        categories: categoryIds
          ? { connect: categoryIds.map((id) => ({ id })) }
          : undefined,
        images: imageUrls
          ? {
              create: imageUrls.map((url) => ({ url })),
            }
          : undefined,
      },
      include: {
        categories: true,
        images: true,
        user: { select: { id: true, email: true } },
      },
    });
  }

  findAll(categoryIds?: number[]) {
    return this.prisma.product.findMany({
      where: categoryIds?.length
        ? {
            categories: { some: { id: { in: categoryIds } } },
          }
        : undefined,
      include: {
        categories: true,
        images: true,
        user: { select: { id: true, email: true } },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        images: true,
        user: { select: { id: true, email: true } },
      },
    });
  }

  update(id: number, dto: UpdateProductDto) {
    const { categoryIds, imageUrls, ...rest } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        categories: categoryIds
          ? { set: categoryIds.map((id) => ({ id })) }
          : undefined,
        images: imageUrls
          ? {
              deleteMany: {},
              create: imageUrls.map((url) => ({ url })),
            }
          : undefined,
      },
      include: {
        categories: true,
        images: true,
        user: { select: { id: true, email: true } },
      },
    });
  }

  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
