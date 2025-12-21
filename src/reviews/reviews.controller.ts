import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Req() req, @Body() dto: CreateReviewDto) {
        return this.reviewsService.create(req.user.userId, dto);
    }

    @Get('product/:productId')
    findAll(
        @Param('productId', ParseIntPipe) productId: number,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        return this.reviewsService.findAllByProduct(
            productId,
            parseInt(page) || 1,
            parseInt(limit) || 10,
        );
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
        // Assuming 'role' is in req.user from JWT strategy
        return this.reviewsService.remove(id, req.user.userId, req.user.role);
    }
}
