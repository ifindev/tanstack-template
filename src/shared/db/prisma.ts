import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { logger } from "@/shared/logger";

const dbLogger = logger.child({ module: "prisma" });

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const client = new PrismaClient({
    adapter,
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

  client.$on("query", (event) => {
    dbLogger.debug({
      durationMs: event.duration,
      query: event.query,
      params: event.params,
    });
  });
  client.$on("error", (event) => dbLogger.error(event));
  client.$on("warn", (event) => dbLogger.warn(event));

  return client;
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Connection URL is provided via prisma.config.ts (datasource.url) for Prisma v7.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
