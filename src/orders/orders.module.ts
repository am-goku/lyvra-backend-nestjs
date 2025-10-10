import { Module } from '@nestjs/common';
import { AdminOrderService, OrdersService } from './orders.service';
import { AdminOrderController, OrdersController } from './orders.controller';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports:[PaymentModule],
  providers: [OrdersService, AdminOrderService],
  controllers: [OrdersController, AdminOrderController],
})
export class OrdersModule {}
