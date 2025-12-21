import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AdminGetUsersDto } from './dto/admin-get-users.dto';
import { Role } from '@prisma/client';

@Controller('users')
@Roles("USER", "ADMIN")
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    getUserById(@Req() req: any) {
        return this.usersService.findById(req.user.id);
    }

    @Put('me')
    updateUser(
        @Req() req: any,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.update(req.user.id, dto);
    }

    @Delete('me')
    deleteUser(@Req() req: any) {
        return this.usersService.remove(req.user.id);
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