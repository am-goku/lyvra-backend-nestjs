import { Test, TestingModule } from '@nestjs/testing';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

describe('AddressController', () => {
    let controller: AddressController;
    let service: AddressService;

    const mockAddressService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AddressController],
            providers: [
                { provide: AddressService, useValue: mockAddressService },
            ],
        }).compile();

        controller = module.get<AddressController>(AddressController);
        service = module.get<AddressService>(AddressService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: any = {
                fullName: 'John',
                phone: '123',
                house: '1',
                city: 'C',
                state: 'S',
                postalCode: '000',
                country: 'US',
            };
            const req = { user: { userId: 1 } };
            await controller.create(req as any, dto);
            // Note: Controller.create signature is (@Req() req, @Body() dto)
            // I need to double check the signature in src/address/address.controller.ts
            expect(service.create).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            const req = { user: { userId: 1 } };
            await controller.findAll(req as any);
            expect(service.findAll).toHaveBeenCalledWith(1);
        });
    });
});
