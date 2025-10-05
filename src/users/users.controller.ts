import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    getUsers() {
        return this.usersService.findAll();
    }

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
