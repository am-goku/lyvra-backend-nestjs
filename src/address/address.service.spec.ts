import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from './address.service';
import { PrismaService } from 'prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('AddressService', () => {
    let service: AddressService;
    let prisma: PrismaService;

    const mockPrismaService = {
        address: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddressService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<AddressService>(AddressService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an address', async () => {
            const dto = {
                fullName: 'John Doe',
                phone: '1234567890',
                house: '123',
                city: 'City',
                state: 'State',
                postalCode: '12345',
                country: 'Country',
                isDefault: true,
                addressType: 'HOME',
            };
            const userId = 1;
            const createdAddress = { id: 1, ...dto, userId };

            mockPrismaService.address.create.mockResolvedValue(createdAddress);
            mockPrismaService.address.count.mockResolvedValue(1);
            // If isDefault is true, it should unset other defaults
            mockPrismaService.address.updateMany.mockResolvedValue({ count: 1 });

            const result = await service.create(userId, dto);

            expect(mockPrismaService.address.updateMany).toHaveBeenCalledWith({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
            expect(mockPrismaService.address.create).toHaveBeenCalledWith({
                data: { ...dto, userId, isDefault: true },
            });
            expect(result).toEqual(createdAddress);
        });
    });

    describe('findAll', () => {
        it('should return an array of addresses', async () => {
            const userId = 1;
            const addresses = [{ id: 1, userId, city: 'City' }];
            mockPrismaService.address.findMany.mockResolvedValue(addresses);

            const result = await service.findAll(userId);

            expect(mockPrismaService.address.findMany).toHaveBeenCalledWith({
                where: { userId },
                orderBy: { isDefault: 'desc' },
            });
            expect(result).toEqual(addresses);
        });
    });

    describe('update', () => {
        it('should update an address', async () => {
            const id = 1;
            const userId = 1;
            const dto = { city: 'New City' };
            const updatedAddress = { id, userId, ...dto };

            // Mock finding the address checking ownership
            mockPrismaService.address.findFirst.mockResolvedValue({ id, userId });
            mockPrismaService.address.update.mockResolvedValue(updatedAddress);

            const result = await service.update(id, userId, dto);

            expect(mockPrismaService.address.findFirst).toHaveBeenCalledWith({
                where: { id, userId },
            });
            expect(mockPrismaService.address.update).toHaveBeenCalledWith({
                where: { id },
                data: dto,
            });
            expect(result).toEqual(updatedAddress);
        });

        it('should throw BadRequestException (or NotFound) if address not found or not owned', async () => {
            const id = 1;
            const userId = 1;
            const dto = { city: 'New City' };

            mockPrismaService.address.findFirst.mockResolvedValue(null);
            // Service throws NotFoundException, which jest handles fine generally, but verifying type
            // Actual service code uses NotFoundException for findOne failing.

            await expect(service.update(id, userId, dto)).rejects.toThrow();
        });
    });
});
