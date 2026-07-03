import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/server/db/prisma";
import { redis } from "@/lib/server/redis/client";

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok" as const;
  } catch {
    return "error" as const;
  }
}

async function checkRedis() {
  try {
    const result = await redis.ping();
    return result === "PONG" ? ("ok" as const) : ("error" as const);
  } catch {
    return "error" as const;
  }
}

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const [db, redisStatus] = await Promise.all([
          checkDatabase(),
          checkRedis(),
        ]);
        const healthy = db === "ok" && redisStatus === "ok";
        return Response.json(
          {
            status: healthy ? "ok" : "degraded",
            db,
            redis: redisStatus,
          },
          { status: healthy ? 200 : 503 },
        );
      },
    },
  },
});
