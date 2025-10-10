import { IsIn, IsOptional, IsString, Matches } from "class-validator";

export class GetOrderTrendsDto {
    @IsOptional()
    @IsIn(["daily", "weekly", "monthly"], {
        message: "range must be one of: daily, weekly, monthly",
    })
    range?: "daily" | "weekly" | "monthly" = "monthly";

    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/, {
        message: "startDate must be a valid ISO date (e.g. 2025-01-01 or 2025-01-01T00:00:00Z)",
    })
    startDate?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/, {
        message: "endDate must be a valid ISO date (e.g. 2025-01-01 or 2025-01-01T00:00:00Z)",
    })
    endDate?: string;
}