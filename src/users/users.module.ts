import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminUsersController, UsersController } from './users.controller';

@Module({
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
})
export class UsersModule {}
