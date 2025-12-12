import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import databaseConfig from "./config/database.config";
import { PrismaModule } from "prisma/prisma.module";
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { PaymentModule } from './payment/payment.module';
import { EmailModule } from './mail/email.module';
import { AdminModule } from './admin/admin.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { RedisModule } from "./redis/redis.module";
import { OtpModule } from "./otp/otp.module";
import { HealthModule } from './health/health.module'; // ✅ Added

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      load: [databaseConfig],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CartModule,
    CheckoutModule,
    PaymentModule,

    EmailModule,
    AdminModule,
    WishlistModule,
    RedisModule,
    OtpModule,
    HealthModule, // ✅ Added
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
