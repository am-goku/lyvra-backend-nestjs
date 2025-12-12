import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService, AdminOrderService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { OrderStatusDto, AdminGetOrdersDto } from './dto/admin-order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get()
  findAll(@Req() req) {
    return this.ordersService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ordersService.findOne(id, req.user.userId);
  }

  @Put(':id/cancel')
  cancelOrder(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ordersService.cancelOrder(id, req.user.userId);
  }
}

@Controller('admin/orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrdersController {
  constructor(private readonly adminOrderService: AdminOrderService) { }

  @Get()
  getAll(@Query() query: AdminGetOrdersDto) {
    return this.adminOrderService.getAllOrders(query);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminOrderService.getOrderById(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OrderStatusDto,
  ) {
    return this.adminOrderService.updateOrderStatus(id, dto);
  }

  @Delete(':id')
  deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminOrderService.deleteOrder(id);
  }
}
