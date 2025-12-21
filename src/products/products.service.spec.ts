import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { SortBy } from './dto/get-products.dto';

describe('ProductsService', () => {
    let service: ProductsService;
    let prisma: PrismaService;

    const mockPrismaService = {
        product: {
            findMany: jest.fn(),
            count: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        productImage: {
            findMany: jest.fn(),
            deleteMany: jest.fn()
        }
    };

    const mockCloudinaryService = {
        deleteImages: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: CloudinaryService, useValue: mockCloudinaryService },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should filter by price and search term', async () => {
            const query = {
                search: 'phone',
                minPrice: 100,
                maxPrice: 500,
                sortBy: SortBy.PRICE_ASC,
                page: 1,
                limit: 10,
            };

            mockPrismaService.product.findMany.mockResolvedValue([]);
            mockPrismaService.product.count.mockResolvedValue(0);

            const result = await service.findAll(query);

            expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        { name: { contains: 'phone' } },
                        { description: { contains: 'phone' } },
                    ]),
                    price: { gte: 100, lte: 500 },
                }),
                orderBy: { price: 'asc' },
                take: 10,
                skip: 0,
            }));
        });
    });
});
