import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "@/lib/server/redis/client";

export const chatRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:chat",
  points: 20,
  duration: 60,
});
