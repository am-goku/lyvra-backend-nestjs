import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AdminGetUsersDto } from './dto/admin-get-users.dto';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findById(id);
    }

    @Post()
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Put(':id')
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

}

@Controller('admin/users')
@Roles("ADMIN")
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminUsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    getUsers(@Query() query: AdminGetUsersDto) {
        return this.usersService.findAll(query);
    }

    @Get(":id")
    async getUserById(@Param("id", ParseIntPipe) id: number) {
        return this.usersService.findById(id);
    }

    @Patch(":id/role")
    async updateUserRole(
        @Param("id", ParseIntPipe) id: number,
        @Body("role") role: Role
    ) {
        return this.usersService.updateUserRole(id, role);
    }

    @Patch(":id/deactivate")
    async deactivateUser(@Param("id", ParseIntPipe) id: number) {
        return this.usersService.deactivateUser(id);
    }
}