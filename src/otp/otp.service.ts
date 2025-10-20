import { Injectable } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
    constructor(
        private readonly redis: RedisService
    ) { };

    private makeOtpCacheKey(email: string) {
        return `${email}:OTP`
    }

    private generateOtp() {
        const OTP = Math.floor(100000 + Math.random() * 900000).toString();
        return OTP;
    }

    async createOTP(email: string) {
        const OTP = this.generateOtp();
        const hashedOtp = await bcrypt.hash(OTP, 10);

        //Caching
        const key = this.makeOtpCacheKey(email);
        await this.redis.set(key, hashedOtp, 300);

        return OTP;
    }

    async verifyOtp(email: string, OTP: string) {
        const key = this.makeOtpCacheKey(email);
        const hashedOtp = await this.redis.get(key);
        return await bcrypt.compare(OTP, hashedOtp);
    }

    async deleteOtp(email: string) {
        const key = this.makeOtpCacheKey(email);
        await this.redis.del(key);
        return true
    }
}