import { PrismaClient } from '@prisma/client';
import { resetDb } from './utils/db-reset';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Coupons Debug Seed...');
    try {
        await resetDb(prisma);
        console.log('DB Reset OK');

        const hasedPass = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.create({
            data: { email: 'admin@test.com', password: hasedPass, role: 'ADMIN' as any }
        });
        console.log('Admin OK');

        const user = await prisma.user.create({
            data: { email: 'user@test.com', password: hasedPass, role: 'USER' as any }
        });
        console.log('User OK');

        const category = await prisma.category.create({
            data: { name: 'Test Category' }
        });
        console.log('Category OK');

        const product = await prisma.product.create({
            data: {
                name: 'Coupon Product',
                price: 100,
                stock: 10,
                categories: { connect: { id: category.id } },
                createdBy: user.id
            }
        });
        console.log('Product OK');

        await prisma.cart.create({
            data: {
                userId: user.id,
                total: '100', // Decimal as string
                items: {
                    create: { productId: product.id, quantity: 1, priceSnapshot: '100' }
                }
            }
        });
        console.log('Cart OK');

    } catch (e: any) {
        console.error('Seed Failed:', e.message);
        if (e.meta) console.error('Meta:', e.meta);
    } finally {
        await prisma.$disconnect();
    }
}

main();
