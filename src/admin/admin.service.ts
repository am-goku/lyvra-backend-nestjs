import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { format, parseISO, subDays, subMonths, subWeeks, subYears } from 'date-fns';

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

    async getOrderTrends(
        range: "daily" | "weekly" | "monthly" = "monthly",
        startDate?: string,
        endDate?: string
    ) {
        const now = new Date();
        const start = startDate ? parseISO(startDate) :
            range === 'daily' ? subDays(now, 30) :
                range === 'weekly' ? subWeeks(now, 12) :
                    subMonths(now, 6);

        const end = endDate ? parseISO(endDate) : now;

        // Fetching order in the date range
        const orders = await this.prisma.order.findMany({
            where: { createdAt: { gte: start, lte: end } },
            select: { total: true, createdAt: true },
            orderBy: { createdAt: 'asc' }
        });

        // Grouping orders
        const grouped: Record<string, { orders: number; revenue: number }> = {};

        for (const o of orders) {
            let key: string;
            if (range === 'daily') key = format(o.createdAt, "yyyy-MM-dd");
            else if (range === 'weekly') key = format(o.createdAt, "yyyy-'W'II"); // ISO Week
            else key = format(o.createdAt, "yyyy-MM"); // Monthly

            if (!grouped[key]) grouped[key] = { orders: 0, revenue: 0 };
            grouped[key].orders += 1;
            grouped[key].revenue += o.total;
        }

        // Converting to array with growth %
        const labels = Object.keys(grouped).sort();
        const result = labels.map((label, i) => {
            const current = grouped[label];
            const prev = i > 0 ? grouped[label[i - 1]] : null;
            const growthOrders = prev ? ((current.orders - prev.orders) / prev.orders) * 100 : null;
            const growthRevenue = prev ? ((current.revenue - prev.revenue) / prev.revenue) * 100 : null;

            return {
                period: label,
                orders: current.orders,
                revenue: current.revenue,
                growthOrders: growthOrders !== null ? +growthOrders.toFixed(2) : null,
                growthRevenue: growthRevenue !== null ? +growthRevenue.toFixed(2) : null
            }
        });

        return result;

    }
}
