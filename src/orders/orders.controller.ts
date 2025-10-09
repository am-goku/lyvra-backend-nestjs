import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AdminGetOrdersDto, OrderStatusDto } from './dto/admin-order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { };

    @Post()
    create(@Body() dto: CreateOrderDto, @Req() req) {
        return this.ordersService.create(dto, req.user.userId);
    }

    @Post('cancel')
    cancelOrder(@Body() dto: CancelOrderDto, @Req() req) {
        return this.ordersService.cancelOrder(dto.orderId, req.user.userId);
    }

    @Get()
    findAll(@Req() req) {
        return this.ordersService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this.ordersService.findOne(id, req.user.userId);
    }
}

@Controller('admin/orders')
@Roles('ADMIN')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminOrderController {
    constructor(private readonly orderService: OrdersService) { };

    @Get()
    getAllOrders(@Query() query: AdminGetOrdersDto) {
        return this.orderService.getAllOrders(query);
    }

    @Get(':id')
    getOrderById(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.getOrderById(id);
    }

    @Patch(':id/status')
    updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: OrderStatusDto) {
        return this.orderService.updateOrderStatus(id, dto);
    }

    @Delete(':id')
    deleteOrder(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.deleteOrder(id)
    }
}
