import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AdminGetUsersDto } from './dto/admin-get-users.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: AdminGetUsersDto) {
        const limit = query.limit || 20;
        const page = query.page || 0;
        const search = query.search
        const skip: number = (page - 1) * limit || 0;

        const where: Prisma.UserWhereInput = search ? {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } }
            ]
        } : {}

        const [user, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, email: true, role: true, isActive: true }
            }),
            this.prisma.user.count({ where })
        ]);

        return {
            data: user,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    } // Fetch all users with filter and pagination (admin only)

    findById(id: number) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    create(data: { email: string; password: string }) {
        return this.prisma.user.create({ data });
    }

    update(id: number, data: { email?: string; password?: string }) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    remove(id: number) {
        return this.prisma.user.delete({ where: { id } });
    }

    updateUserRole(id: number, role: Role) {
        return this.prisma.user.update({
            where: { id },
            data: { role },
        });
    }

    deactivateUser(id: number) {
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
