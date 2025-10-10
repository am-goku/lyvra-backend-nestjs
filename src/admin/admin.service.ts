import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { format, parseISO, subDays, subMonths, subYears } from 'date-fns';

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

    async getSalesAnalytics(
        range: "daily" | "monthly" | "yearly" = "monthly",
        startDate?: string,
        endDate?: string
    ) {
        const now = new Date();
        let start: Date;
        let end: Date = endDate ? parseISO(endDate) : now;
        let groupBy: "day" | "month" | "year";

        if (startDate) {
            start = parseISO(startDate);
        } else {
            // default ranges
            if (range === "daily") start = subDays(now, 7);
            else if (range === "monthly") start = subMonths(now, 6);
            else start = subYears(now, 1);
        }

        groupBy = range === "daily" ? "day" : range === "monthly" ? "month" : "year";

        const orders = await this.prisma.order.findMany({
            where: {
                paymentStatus: 'PAID',
                createdAt: { gte: start, lte: end }
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

    async getTopProducts(startDate?: string, endDate?: string) {
        const where: any = {};

        if (startDate) where.createdAt = { gte: parseISO(startDate) };
        if (endDate) where.createdAt = { lte: parseISO(endDate) };

        const products = await this.prisma.orderItem.groupBy({
            by: ["productId"],
            _sum: { quantity: true },
            _count: { productId: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        const details = await Promise.all(
            products.map(async (p) => {
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

    async getUserStats(startDate?: string, endDate?: string) {
        const where: any = {};

        if (startDate) where.createdAt = { gte: parseISO(startDate) };
        if (endDate) where.createdAt = { ...where.createdAt, lte: parseISO(endDate) }

        const total = await this.prisma.user.count({ where });
        const active = await this.prisma.user.count({ where: { ...where, isActive: true } })

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
