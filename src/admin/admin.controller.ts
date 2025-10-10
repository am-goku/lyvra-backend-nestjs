import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';

@Controller('admin')
@Roles(Role.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { };

    @Get("overview")
    getAdminOverview() {
        return this.adminService.getOverview();
    }

    @Get("sales")
    getSales(@Query("range") range: "daily" | "monthly" | "yearly" = "monthly") {
        return this.adminService.getSalesAnalytics(range);
    }

    @Get("top-products")
    getTopProducts() {
        return this.adminService.getTopProducts();
    }

    @Get("user-stats")
    getUserStats() {
        return this.adminService.getUserStats();
    }
}
