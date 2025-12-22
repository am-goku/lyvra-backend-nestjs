import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'prisma/prisma.service';
import { resetDb } from './utils/db-reset';

describe('Products (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        prisma = app.get(PrismaService);
        await resetDb(prisma);

        // Seed Products
        const category1 = await prisma.category.create({ data: { name: 'Electronics' } });
        const category2 = await prisma.category.create({ data: { name: 'Computers' } });

        // Seed User for createdBy
        const user = await prisma.user.create({
            data: { email: 'creator@test.com', password: 'pass', role: 'ADMIN' as any }
        });

        await prisma.product.create({
            data: {
                name: 'Cheap Phone', description: 'Basic phone', price: 100, stock: 10,
                createdBy: user.id,
                categories: { connect: { id: category1.id } }
            }
        });
        await prisma.product.create({
            data: {
                name: 'Expensive Laptop', description: 'Gaming laptop', price: 2000, stock: 5,
                createdBy: user.id,
                categories: { connect: { id: category2.id } }
            }
        });
        await prisma.product.create({
            data: {
                name: 'Mid Tablet', description: 'Good tablet', price: 500, stock: 8,
                createdBy: user.id,
                categories: { connect: { id: category1.id } }
            }
        });

    });

    afterAll(async () => {
        await app.close();
    });

    it('/products (GET) - No Filter', () => {
        return request(app.getHttpServer())
            .get('/products')
            .expect(200)
            .expect((res) => {
                expect(res.body.products).toHaveLength(3);
                console.log('Get Products Pass');
            });
    });

    it('/products (GET) - Filter by Price', () => {
        return request(app.getHttpServer())
            .get('/products?minPrice=400&maxPrice=1000')
            .expect(200)
            .expect((res) => {
                expect(res.body.products).toHaveLength(1);
                expect(res.body.products[0].name).toBe('Mid Tablet');
                console.log('Get Products Filter Pass');
            });
    });

    it('/products (GET) - Search', () => {
        return request(app.getHttpServer())
            .get('/products?search=Laptop')
            .expect(200)
            .expect((res) => {
                expect(res.body.products).toHaveLength(1);
                expect(res.body.products[0].name).toBe('Expensive Laptop');
                console.log('Get Products Search Pass');
            });
    });

    it('/products (GET) - Sort', () => {
        return request(app.getHttpServer())
            .get('/products?sortBy=price_desc')
            .expect(200)
            .expect((res) => {
                expect(res.body.products[0].name).toBe('Expensive Laptop');
                console.log('Get Products Sort Pass');
            });
    });
});
