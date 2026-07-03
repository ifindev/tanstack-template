import Redis from "ioredis";
import { env } from "@/lib/server/env";
import { logger } from "@/lib/server/logger";

const redisLogger = logger.child({ module: "redis" });

export const redis = new Redis(env.redisUrl);

redis.on("error", (error) => {
  redisLogger.error({ error }, "Redis connection error");
});

redis.on("connect", () => {
  redisLogger.info("Redis connected");
});
