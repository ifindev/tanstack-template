import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/server/env";
import { logger } from "@/lib/server/logger";

const dbLogger = logger.child({ module: "prisma" });

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
  });
  const client = new PrismaClient({
    adapter,
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

  if (env.prismaLog) {
    client.$on(
      "query",
      (event: { duration: number; query: string; params: string }) => {
        dbLogger.debug({
          durationMs: event.duration,
          query: event.query,
          params: event.params,
        });
      },
    );
  }
  client.$on("error", (event: { message: string; target: string }) =>
    dbLogger.error(event),
  );
  client.$on("warn", (event: { message: string; target: string }) =>
    dbLogger.warn(event),
  );

  return client;
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.nodeEnv !== "production") globalForPrisma.prisma = prisma;
