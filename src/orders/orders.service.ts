import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { };

    async create(dto: CreateOrderDto, userId: number) {
        const productIds = dto.items.map(i => i.productId);

        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } }
        })

        if (productIds.length !== products.length) {
            throw new Error('Some products not found.')
        }

        const total = dto.items.reduce((sum, item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) throw new Error("Some product not found");
            return sum + (product.price * item.quantity);
        }, 0);

        return this.prisma.order.create({
            data: {
                userId,
                total,
                orderItems: {
                    create: dto.items.map((item) => ({
                        quantity: item.quantity,
                        price: products.find(p => p.id === item.productId)?.price || 0,
                        product: { connect: { id: item.productId } }
                    }))
                },
            },
            include: {
                orderItems: { include: { product: true } }
            }
        })
    }

    findAll(userId: number) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { orderItems: { include: { product: true } } },
        });
    }

    findOne(id: number, userId: number) {
        return this.prisma.order.findFirst({
            where: { id, userId },
            include: { orderItems: { include: { product: true } } },
        });
    }
}
