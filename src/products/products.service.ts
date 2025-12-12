import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService
  ) { }

  async create(dto: CreateProductDto, userId: number) {
    const { categoryIds, imageData, ...rest } = dto;

    return this.prisma.product.create({
      data: {
        ...rest,
        createdBy: userId,
        categories: categoryIds?.length ? { connect: categoryIds.map((id) => ({ id })) } : undefined,
        images: imageData
          ? {
            create: imageData.map((image) => ({
              url: image.url,
              public_id: image.public_id,
              asset_id: image.asset_id,
            })),
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

  findAll(categoryIds?: number[], page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    return this.prisma.product.findMany({
      where: {
        deletedAt: null, // ✅ Only show non-deleted products
        ...(categoryIds?.length
          ? { categories: { some: { id: { in: categoryIds } } } }
          : {}),
      },
      include: {
        categories: true,
        images: true,
      },
      skip, // ✅ Added pagination
      take: limit, // ✅ Added pagination
      orderBy: { createdAt: 'desc' }, // ✅ Newest first
    });
  }

  findOne(id: number) {
    return this.prisma.product.findFirst({ // ✅ Changed to findFirst to filter deletedAt
      where: {
        id,
        deletedAt: null // ✅ Only show non-deleted products
      },
      include: {
        categories: true,
        images: true,
      },
    });
  }

  update(id: number, dto: UpdateProductDto) {
    const { categoryIds, imageData, ...rest } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        categories: categoryIds
          ? { set: categoryIds.map((id) => ({ id })) }
          : undefined,
        images: imageData
          ? {
            create: imageData.map((image) => ({
              url: image.url,
              public_id: image.public_id,
              asset_id: image.asset_id,
            })),
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

  async remove(id: number) {
    const isExist = await this.prisma.product.count({ where: { id, deletedAt: null } }) // ✅ Check if not already deleted
    if (!isExist) throw new BadRequestException('No product found on the provided ID');

    // ✅ Soft delete instead of hard delete
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }



  private async removeProductImages(productId: number): Promise<any> {
    const productImages = await this.prisma.productImage.findMany({ where: { productId }, select: { public_id: true } });

    const public_ids = productImages.map(pI => pI.public_id);

    const response = await this.cloudinary.deleteImages(public_ids);

    if (!response) throw Error("Error deleting image.");

    return this.prisma.productImage.deleteMany({ where: { productId } })
  }

}
