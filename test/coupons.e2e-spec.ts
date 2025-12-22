import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'prisma/prisma.service';
import { resetDb } from './utils/db-reset';

describe('Coupons (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let adminToken: string;
    let userToken: string;
    let userId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        prisma = app.get(PrismaService);
        await resetDb(prisma);

        // 1. Seed Admin
        const hasedPass = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: { email: 'admin@test.com', password: hasedPass, role: 'ADMIN' as any }
        });
        const adminLogin = await request(app.getHttpServer()).post('/auth/login').send({ email: 'admin@test.com', password: 'admin123' });
        adminToken = adminLogin.body.token;

        // 2. Seed User
        const user = await prisma.user.create({
            data: { email: 'user@test.com', password: hasedPass, role: 'USER' as any }
        });
        userId = user.id;
        const userLogin = await request(app.getHttpServer()).post('/auth/login').send({ email: 'user@test.com', password: 'admin123' });
        userToken = userLogin.body.token;

        // 3. Seed Items in Cart for User
        const category = await prisma.category.create({
            data: { name: 'Test Category' }
        });

        const product = await prisma.product.create({
            data: {
                name: 'Coupon Product',
                price: 100,
                stock: 10,
                categories: { connect: { id: category.id } },
                createdBy: user.id
            }
        });
        await prisma.cart.create({
            data: {
                userId: user.id,
                total: '100', // String for Decimal
                items: {
                    create: { productId: product.id, quantity: 1, priceSnapshot: '100' }
                }
            }
        });
    });

    afterAll(async () => {
        await app.close();
    });

    it('/coupons (POST) - Admin Create Coupon', () => {
        return request(app.getHttpServer())
            .post('/coupons')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                code: 'TEST10',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                expiresAt: new Date(Date.now() + 86400000).toISOString(),
                usageLimit: 100
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.code).toBe('TEST10');
                console.log('Create Coupon Pass');
            });
    });

    it('/coupons/apply (POST) - User Apply Coupon', () => {
        return request(app.getHttpServer())
            .post('/coupons/apply')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ code: 'TEST10' })
            .expect(201)
            .expect((res) => {
                expect(res.body.coupon.code).toBe('TEST10');
                console.log('Apply Coupon Pass');
            });
    });
});
