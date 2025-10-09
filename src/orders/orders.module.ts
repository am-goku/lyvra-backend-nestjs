import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AdminOrderController, OrdersController } from './orders.controller';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports:[PaymentModule],
  providers: [OrdersService],
  controllers: [OrdersController, AdminOrderController],
})
export class OrdersModule {}
