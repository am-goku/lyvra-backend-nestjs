import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [UsersModule, OrdersModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService]
})
export class AdminModule {}
