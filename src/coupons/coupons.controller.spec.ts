import { Test, TestingModule } from '@nestjs/testing';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

describe('CouponsController', () => {
    let controller: CouponsController;
    let service: CouponsService;

    const mockCouponsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        applyCoupon: jest.fn(),
        removeCouponFromCart: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CouponsController],
            providers: [
                { provide: CouponsService, useValue: mockCouponsService },
            ],
        }).compile();

        controller = module.get<CouponsController>(CouponsController);
        service = module.get<CouponsService>(CouponsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: any = { code: 'TEST' };
            const req = { user: { role: 'ADMIN' } };
            await controller.create(req, dto);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('apply', () => {
        it('should call service.applyCoupon', async () => {
            const dto = { code: 'TEST' };
            const req = { user: { userId: 1 } };
            await controller.apply(req, dto);
            expect(service.applyCoupon).toHaveBeenCalledWith(1, 'TEST');
        });
    });
});
