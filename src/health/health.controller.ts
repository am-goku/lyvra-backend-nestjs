import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from 'prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private prismaHealth: PrismaHealthIndicator,
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            // Check database connectivity
            () => this.prismaHealth.pingCheck('database', this.prisma),

            // Check Redis connectivity
            async () => {
                try {
                    await this.redis.set('health:check', 'ok', 5);
                    const value = await this.redis.get('health:check');
                    if (value === 'ok') {
                        return { redis: { status: 'up' } };
                    }
                    throw new Error('Redis health check failed');
                } catch (error) {
                    return { redis: { status: 'down', message: error.message } };
                }
            },
        ]);
    }

    @Get('ready')
    @HealthCheck()
    readiness() {
        // Readiness check - is the app ready to serve traffic?
        return this.health.check([
            () => this.prismaHealth.pingCheck('database', this.prisma),
        ]);
    }

    @Get('live')
    liveness() {
        // Liveness check - is the app alive?
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
