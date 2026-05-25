import { RateLimiterMemory } from "rate-limiter-flexible";
import { vi } from "vitest";

vi.mock("@/shared/rate-limit/auth", () => ({
  authRateLimiter: new RateLimiterMemory({ points: 100, duration: 1 }),
}));

vi.mock("@/shared/rate-limit/chat", () => ({
  chatRateLimiter: new RateLimiterMemory({ points: 100, duration: 1 }),
}));

vi.mock("@/shared/db/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
    conversation: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    message: { create: vi.fn() },
  },
}));

vi.mock("@/shared/redis/client", () => ({
  redis: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));
