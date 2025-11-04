import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    /** ─────────────────────────────
     *  Create category (optionally link products)
     *  ───────────────────────────── */
    async create(dto: CreateCategoryDto) {
        const exists = await this.prisma.category.findUnique({
            where: { name: dto.name },
        });
        if (exists) throw new ConflictException('Category name already exists');

        return this.prisma.category.create({
            data: {
                name: dto.name,
                description: dto.description,
                active: dto.active ?? true,
                products: dto.productIds
                    ? {
                        connect: dto.productIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
            include: { products: true },
        });
    }

    /** ─────────────────────────────
     *  Find all categories (pagination + search)
     *  ───────────────────────────── */
    findAll(params?: { skip?: number; take?: number; search?: string }) {
        const { skip = 0, take = 20, search } = params || {};
        return this.prisma.category.findMany({
            where: {
                deletedAt: null,
                name: search ? { contains: search, mode: 'insensitive' } : undefined,
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: { products: true },
        });
    }

    /** ─────────────────────────────
     *  Find one category by ID
     *  ───────────────────────────── */
    async findOne(id: number) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { products: true },
        });
        if (!category || category.deletedAt)
            throw new NotFoundException('Category not found');
        return category;
    }

    /** ─────────────────────────────
     *  Update category details or product links
     *  ───────────────────────────── */
    async update(id: number, dto: UpdateCategoryDto) {
        await this.findOne(id);

        // handle product connect/disconnect
        const connect = dto.addProductIds?.map((id) => ({ id })) ?? [];
        const disconnect = dto.removeProductIds?.map((id) => ({ id })) ?? [];

        return this.prisma.category.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                active: dto.active,
                products:
                    connect.length || disconnect.length
                        ? { connect, disconnect }
                        : undefined,
            },
            include: { products: true },
        });
    }

    /** ─────────────────────────────
     *  Soft delete (mark as deleted)
     *  Prevents deletion if linked products exist
     *  ───────────────────────────── */
    async remove(id: number, soft = true) {
        const category = await this.findOne(id);

        if (category.products.length > 0)
            throw new ConflictException(
                'Cannot delete category with linked products',
            );

        if (soft) {
            return this.prisma.category.update({
                where: { id },
                data: { deletedAt: new Date(), active: false },
            });
        }

        // Hard delete (rarely used)
        return this.prisma.category.delete({ where: { id } });
    }

    /** ─────────────────────────────
     *  Count active categories
     *  ───────────────────────────── */
    count() {
        return this.prisma.category.count({ where: { deletedAt: null } });
    }

    /** ─────────────────────────────
     *  Bulk create (e.g. seed or import)
     *  ───────────────────────────── */
    createMany(dtos: CreateCategoryDto[]) {
        return this.prisma.category.createMany({
            data: dtos.map((dto) => ({
                name: dto.name,
                description: dto.description,
                active: dto.active ?? true,
            })),
            skipDuplicates: true,
        });
    }
}
