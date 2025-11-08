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
      },
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
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
    const isExist = await this.prisma.product.count({where: {id}})
    if (!isExist) throw new BadRequestException('No product found on the provided ID');

    await this.removeProductImages(id)
    return this.prisma.product.delete({ where: { id } });
  }



  private async removeProductImages(productId: number): Promise<any> {
    const productImages = await this.prisma.productImage.findMany({ where: { productId }, select: { public_id: true } });

    const public_ids = productImages.map(pI => pI.public_id);

    const response = await this.cloudinary.deleteImages(public_ids);

    if (!response) throw Error("Error deleting image.");

    return this.prisma.productImage.deleteMany({ where: { productId } })
  }

}
