import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: number, dto: CreateAddressDto) {
        // If setting as default, unset other defaults
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        // Check if this is the first address, if so make it default automatically
        const count = await this.prisma.address.count({ where: { userId } });
        const isDefault = count === 0 ? true : dto.isDefault;

        return this.prisma.address.create({
            data: {
                ...dto,
                userId,
                isDefault,
            },
        });
    }

    async findAll(userId: number) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' }, // Defaults first
        });
    }

    async findOne(id: number, userId: number) {
        const address = await this.prisma.address.findFirst({
            where: { id, userId },
        });

        if (!address) throw new NotFoundException('Address not found');

        return address;
    }

    async update(id: number, userId: number, dto: UpdateAddressDto) {
        await this.findOne(id, userId); // Ensure exists and belongs to user

        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.address.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: number, userId: number) {
        await this.findOne(id, userId); // Ensure exists

        return this.prisma.address.delete({
            where: { id },
        });
    }
}
