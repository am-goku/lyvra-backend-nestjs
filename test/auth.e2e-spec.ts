import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'prisma/prisma.service';
import { resetDb } from './utils/db-reset';

describe('Auth (e2e)', () => {
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
    });

    afterAll(async () => {
        await app.close();
    });

    describe('SEED USER & LOGIN', () => {
        const userData = {
            email: 'e2e@example.com',
            password: 'password123',
            role: 'USER',
        };

        it('should seed a user directly via Prisma', async () => {
            const hasedPass = await bcrypt.hash(userData.password, 10);
            const user = await prisma.user.create({
                data: {
                    email: userData.email,
                    password: hasedPass,
                    role: 'USER' as any,
                }
            });
            expect(user).toBeDefined();
        });

        it('/auth/login (POST) - Success', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('token');
                    expect(res.body.user).toHaveProperty('email', userData.email);
                    console.log('User Login Pass');
                });
        });

        it('/auth/login (POST) - Fail Password', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: userData.email, password: 'wrong' })
                .expect(401);
        });
    });
});
