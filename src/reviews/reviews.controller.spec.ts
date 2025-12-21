import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
    let controller: ReviewsController;
    let service: ReviewsService;

    const mockReviewsService = {
        create: jest.fn(),
        findAllByProduct: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReviewsController],
            providers: [
                { provide: ReviewsService, useValue: mockReviewsService },
            ],
        }).compile();

        controller = module.get<ReviewsController>(ReviewsController);
        service = module.get<ReviewsService>(ReviewsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: any = { productId: 1, rating: 5, comment: 'Nice' };
            const req = { user: { userId: 1, role: 'USER' } };
            await controller.create(req, dto);
            expect(service.create).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('findAll', () => {
        it('should call service.findAllByProduct', async () => {
            await controller.findAll(1);
            expect(service.findAllByProduct).toHaveBeenCalledWith(1, 1, 10);
        });
    });
});
