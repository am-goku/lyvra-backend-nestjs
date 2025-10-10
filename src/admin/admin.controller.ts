import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';
import { GetOrderTrendsDto } from './dto/get-order-trends.dto';

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
    getSales(
        @Query("range") range: "daily" | "monthly" | "yearly" = "monthly",
        @Query("startDate") startDate?: string,
        @Query("endDate") endDate?: string
    ) {
        return this.adminService.getSalesAnalytics(range, startDate, endDate);
    }

    @Get("top-products")
    getTopProducts(
        @Query("startDate") startDate?: string,
        @Query("endDate") endDate?: string
    ) {
        return this.adminService.getTopProducts(startDate, endDate);
    }

    @Get("user-stats")
    getUserStats(
        @Query("startDate") startDate?: string,
        @Query("endDate") endDate?: string
    ) {
        return this.adminService.getUserStats(startDate, endDate);
    }

    @Get("order-trend")
    getOrderTrend(@Query() query: GetOrderTrendsDto) {
        const { range, startDate, endDate } = query;
        return this.adminService.getOrderTrends(range, startDate, endDate);
    }
}
