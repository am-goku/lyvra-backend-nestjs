import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('address')
@UseGuards(AuthGuard('jwt'))
export class AddressController {
    constructor(private readonly addressService: AddressService) { }

    @Post()
    create(@Req() req, @Body() dto: CreateAddressDto) {
        return this.addressService.create(req.user.userId, dto);
    }

    @Get()
    findAll(@Req() req) {
        return this.addressService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.addressService.findOne(id, req.user.userId);
    }

    @Put(':id')
    update(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAddressDto,
    ) {
        return this.addressService.update(id, req.user.userId, dto);
    }

    @Delete(':id')
    remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.addressService.remove(id, req.user.userId);
    }
}
