import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
    private client: Redis;

    onModuleInit() {
        const host = process.env.REDIS_HOST || 'localhost'; // ✅ Default to localhost for local dev
        const port = Number(process.env.REDIS_PORT) || 6379;

        this.client = new Redis({
            host,
            port,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
        });

        this.client.on('error', (err) => {
            console.error('❌ Redis Connection Error:', err.message);
        });

        this.client.on('connect', () => {
            console.log(`✅ Redis connected successfully at ${host}:${port}`);
        });
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    //get Parsed JSON or raw string
    async get<T = any>(key: string): Promise<T | null> {
        const v = await this.client.get(key);
        if (!v) return null;

        try {
            return JSON.parse(v) as T;
        } catch {
            return v as unknown as T;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<'OK'> {
        const v = typeof value === 'string' ? value : JSON.stringify(value);

        if (ttlSeconds) return this.client.set(key, v, 'EX', ttlSeconds);

        return this.client.set(key, v);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    // convinience: delete keys by pattern (useful for invalidation)
    async delByPattern(pattern: string): Promise<void> {
        const stream = this.client.scanStream({ match: pattern, count: 100 });
        const keys: string[] = [];
        for await (const resultKeys of stream) {
            if (resultKeys.length) keys.push(...resultKeys);
        }

        if (keys.length) await this.client.del(...keys);
    }
}