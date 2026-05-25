import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "@/shared/redis/client";

export const authRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:auth",
  points: 10,
  duration: 60,
});
