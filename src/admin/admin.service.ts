import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { format, subDays, subMonths, subYears } from 'date-fns';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    async getOverview() {
        const [users, orders, revenue] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.order.count(),
            this.prisma.order.aggregate({
                _sum: { total: true },
                where: { paymentStatus: 'PAID' }
            })
        ]);

        return {
            totalUsers: users,
            totalOrders: orders,
            totalRevenue: revenue._sum.total || 0
        }
    }

    async getSalesAnalytics(range: "daily" | "monthly" | "yearly" = "monthly") {
        const now = new Date();
        let startDate: Date;
        let groupBy: "day" | "month" | "year";

        if (range === 'daily') {
            startDate = subDays(now, 7)
            groupBy = 'day'
        } else if (range === 'yearly') {
            startDate = subMonths(now, 6);
            groupBy = "month";
        } else {
            startDate = subYears(now, 1);
            groupBy = "year";
        }

        const orders = await this.prisma.order.findMany({
            where: {
                paymentStatus: 'PAID',
                createdAt: { gte: startDate }
            },
            select: {
                total: true,
                createdAt: true
            },

            orderBy: { createdAt: 'asc' }
        })

        const grouped: Record<string, number> = {};

        for (const o of orders) {
            const key =
                groupBy === 'day'
                    ? format(o.createdAt, "MMM dd")
                    : groupBy === 'month'
                        ? format(o.createdAt, "MMM yyyy")
                        : format(o.createdAt, "YYYY");

            grouped[key] = (grouped[key] || 0) + o.total
        }

        return Object.entries(grouped).map(([label, total]) => ({ label, total }));
    }

    async getTopProducts() {
        const products = await this.prisma.orderItem.groupBy({
            by: ["productId"],
            _sum: { quantity: true },
            _count: { productId: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        const details = await Promise.all(products.map(async (p) => {
            const product = await this.prisma.product.findUnique({
                where: { id: p.productId },
                select: { name: true, price: true }
            });

            return {
                ...product,
                quantitySold: p._sum.quantity,
                totalOrders: p._count.productId
            }
        }));

        return details;
    }

    async getUserStats() {
        const total = await this.prisma.user.count();
        const active = await this.prisma.user.count({ where: { isActive: true } })

        const lastMonth = subMonths(new Date(), 1);
        const newUsersLastMonth = await this.prisma.user.count({
            where: { createdAt: { gte: lastMonth } }
        })

        return {
            totalUsers: total,
            activeUsers: active,
            newUsersLastMonth,
            activePercentage: ((active / total) * 100).toFixed(2)
        }
    }
}
