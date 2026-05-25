import { describe, expect, it, vi } from "vitest";
import { VERIFICATION_CALLBACK_URL } from "@/modules/auth/constants";
import { registerUser, resendVerificationEmail } from "@/modules/auth/service";

vi.mock("@/shared/auth/better-auth", () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
      signInEmail: vi.fn(),
      sendVerificationEmail: vi.fn(),
    },
  },
}));

import { auth } from "@/shared/auth/better-auth";

describe("auth service", () => {
  it("registerUser calls auth.api.signUpEmail with correct body", async () => {
    vi.mocked(auth.api.signUpEmail).mockResolvedValueOnce({
      user: { id: "1" },
    } as never);
    await registerUser({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });
    expect(auth.api.signUpEmail).toHaveBeenCalledWith({
      body: {
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
      },
    });
  });

  it("resendVerificationEmail calls auth.api.sendVerificationEmail", async () => {
    vi.mocked(auth.api.sendVerificationEmail).mockResolvedValueOnce(
      {} as never,
    );
    await resendVerificationEmail({ email: "alice@example.com" });
    expect(auth.api.sendVerificationEmail).toHaveBeenCalledWith({
      body: {
        email: "alice@example.com",
        callbackURL: VERIFICATION_CALLBACK_URL,
      },
    });
  });
});
