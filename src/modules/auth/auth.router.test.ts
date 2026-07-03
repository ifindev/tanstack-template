import { afterEach, describe, expect, it, vi } from "vitest";
import { AUTH_ERROR } from "@/modules/auth/auth.constant";
import { authRouter } from "./auth.router";

vi.mock("@/lib/server/auth/better-auth", () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
      sendVerificationEmail: vi.fn(),
    },
  },
}));

vi.mock("@/lib/server/trpc/init", async () => {
  const { initTRPC } = await import("@trpc/server");
  const t = initTRPC.create();
  return {
    router: t.router,
    publicProcedure: t.procedure,
    protectedProcedure: t.procedure,
    authRateLimitedProcedure: t.procedure,
  };
});

import { auth } from "@/lib/server/auth/better-auth";

function createCaller() {
  return authRouter.createCaller({} as never);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("auth router", () => {
  it("maps register failures to stable AUTH_ERROR messages", async () => {
    vi.mocked(auth.api.signUpEmail).mockRejectedValueOnce(
      new Error("Email already exists"),
    );

    await expect(
      createCaller().register({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
      }),
    ).rejects.toMatchObject({
      message: AUTH_ERROR.REGISTRATION_FAILED,
    });
  });

  it("maps resend verification failures to stable AUTH_ERROR messages", async () => {
    vi.mocked(auth.api.sendVerificationEmail).mockRejectedValueOnce(
      new Error("Rate limited upstream"),
    );

    await expect(
      createCaller().resendVerification({ email: "alice@example.com" }),
    ).rejects.toMatchObject({
      message: AUTH_ERROR.SEND_VERIFICATION_FAILED,
    });
  });
});
