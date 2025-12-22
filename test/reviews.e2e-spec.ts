import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'prisma/prisma.service';
import { resetDb } from './utils/db-reset';
import { OrderStatus, PaymentStatus } from '@prisma/client';

describe('Reviews (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let userToken: string;
    let productId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        prisma = app.get(PrismaService);
        await resetDb(prisma);

        // 1. Seed User
        const hasedPass = await bcrypt.hash('pass', 10);
        const user = await prisma.user.create({
            data: { email: 'review@test.com', password: hasedPass, role: 'USER' as any }
        });

        // 2. Login to get Token
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'review@test.com', password: 'pass' });
        userToken = loginRes.body.token;

        // 3. Seed Product
        const category = await prisma.category.create({ data: { name: 'Test Category' } });
        const product = await prisma.product.create({
            data: {
                name: 'Review Product',
                price: 100,
                stock: 10,
                categories: { connect: { id: category.id } },
                createdBy: user.id
            }
        });
        productId = product.id;

        // Seed Address
        const address = await prisma.address.create({
            data: {
                userId: user.id,
                fullName: 'Test User',
                phone: '1234567890',
                house: '123',
                city: 'Test City',
                state: 'Test State',
                country: 'Test Country',
                postalCode: '12345',
            }
        });

        // 4. Seed Delivered Order (Required to review)
        await prisma.order.create({
            data: {
                userId: user.id,
                addressId: address.id,
                total: 100,
                paymentStatus: PaymentStatus.PAID,
                orderStatus: OrderStatus.DELIVERED,
                orderItems: {
                    create: {
                        productId: product.id,
                        quantity: 1,
                        price: 100
                    }
                }
            }
        });
    });

    afterAll(async () => {
        await app.close();
    });

    it('/reviews (POST) - Success', () => {
        return request(app.getHttpServer())
            .post('/reviews')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ productId, rating: 5, comment: 'Great product!' })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('id');
                console.log('Post Review Pass');
            });
    });

    it('/reviews (POST) - Duplicate Fail', () => {
        return request(app.getHttpServer())
            .post('/reviews')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ productId, rating: 4, comment: 'Again?' })
            .expect(400); // Bad Request (Already reviewed)
    });

    it('/reviews/product/:id (GET)', () => {
        return request(app.getHttpServer())
            .get(`/reviews/product/${productId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.reviews).toHaveLength(1);
                expect(res.body.reviews[0].comment).toBe('Great product!');
                console.log('Get Reviews Pass');
            });
    });
});
