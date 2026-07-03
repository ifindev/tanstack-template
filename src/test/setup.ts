import { RateLimiterMemory } from "rate-limiter-flexible";
import { vi } from "vitest";

vi.mock("@/lib/server/rate-limit/auth", () => ({
  authRateLimiter: new RateLimiterMemory({ points: 100, duration: 1 }),
}));

vi.mock("@/lib/server/rate-limit/chat", () => ({
  chatRateLimiter: new RateLimiterMemory({ points: 100, duration: 1 }),
}));

vi.mock("@/lib/server/db/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
    conversation: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    message: { create: vi.fn() },
    $transaction: vi.fn((input: unknown) => {
      if (Array.isArray(input)) {
        return Promise.all(input as Promise<unknown>[]);
      }
      return Promise.resolve([]);
    }),
    $queryRaw: vi.fn(),
  },
}));

vi.mock("@/lib/server/redis/client", () => ({
  redis: { get: vi.fn(), set: vi.fn(), del: vi.fn(), ping: vi.fn() },
}));
