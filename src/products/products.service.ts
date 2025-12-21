import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { GetProductsDto, SortBy } from './dto/get-products.dto'; // ✅ Added

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

  async findAll(query: GetProductsDto) {
    const { search, categoryIds, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    // 1. Text Search
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // 2. Category Filter
    if (categoryIds) {
      const ids = categoryIds.split(',').map((id) => +id);
      where.categories = { some: { id: { in: ids } } };
    }

    // 3. Price Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // 4. Sorting
    let orderBy: any = { createdAt: 'desc' }; // Default
    if (sortBy) {
      switch (sortBy) {
        case SortBy.PRICE_ASC: orderBy = { price: 'asc' }; break;
        case SortBy.PRICE_DESC: orderBy = { price: 'desc' }; break;
        case SortBy.NEWEST: orderBy = { createdAt: 'desc' }; break;
        case SortBy.OLDEST: orderBy = { createdAt: 'asc' }; break;
        case SortBy.NAME_ASC: orderBy = { name: 'asc' }; break;
        case SortBy.NAME_DESC: orderBy = { name: 'desc' }; break;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          categories: true,
          images: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
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
