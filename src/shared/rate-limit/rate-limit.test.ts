import { describe, expect, it } from "vitest";
import { authRateLimiter } from "@/shared/rate-limit/auth";
import { chatRateLimiter } from "@/shared/rate-limit/chat";

// setup.ts swaps both limiters for RateLimiterMemory with 100 points.
// This verifies the swap is in effect and the limiters work without Redis.

describe("rate limiters (memory swap in tests)", () => {
  it("authRateLimiter resolves without error under the limit", async () => {
    await expect(
      authRateLimiter.consume("test-ip-auth"),
    ).resolves.toBeDefined();
  });

  it("chatRateLimiter resolves without error under the limit", async () => {
    await expect(
      chatRateLimiter.consume("test-user-chat"),
    ).resolves.toBeDefined();
  });

  it("authRateLimiter rejects after exhausting points", async () => {
    // Burn all 100 points.
    for (let i = 0; i < 100; i++) {
      await authRateLimiter.consume("exhaust-ip", 1);
    }
    await expect(authRateLimiter.consume("exhaust-ip")).rejects.toBeDefined();
  });
});
