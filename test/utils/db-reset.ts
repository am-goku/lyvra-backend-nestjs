import { PrismaClient } from '@prisma/client';

export const resetDb = async (prisma: PrismaClient) => {
    // Delete in order of dependency (child first)
    // Review -> User, Product
    // OrderItem -> Order, Product
    // Order -> User
    // CartItem -> Cart, Product
    // Cart -> User
    // CouponUsage -> User, Coupon
    // ProductImage -> Product
    // Product -> Category
    // Address -> User
    // User
    // Coupon
    // Category (optional)

    // Use transaction for speed, but split if too large (rare in e2e)
    try {
        const tablenames = await prisma.$queryRaw<
            Array<{ tablename: string }>
        >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

        const tables = tablenames
            .map(({ tablename }) => tablename)
            .filter((name) => name !== '_prisma_migrations')
            .map((name) => `"public"."${name}"`)
            .join(', ');

        if (tables.length > 0) {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
        }
    } catch (error) {
        console.error('Error resetting DB:', error);
        throw error;
    }
};
