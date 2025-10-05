import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.user.findMany();
    }

    findById(id: number) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    create(data: { email: string; password: string }) {
        return this.prisma.user.create({ data });
    }

    update(id: number, data: {email?: string; password?: string}) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    remove(id: number) {
        return this.prisma.user.delete({ where: { id } });
    }
}
