import { RateLimiterMemory } from "rate-limiter-flexible";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleAuthRequest } from "./auth-handler";

const authHandlerMock = vi.fn<(_request: Request) => Promise<Response>>(
  async () => new Response("ok", { status: 200 }),
);

vi.mock("@/lib/server/auth/better-auth", () => ({
  auth: {
    handler: (request: Request) => authHandlerMock(request),
  },
}));

vi.mock("@/lib/server/rate-limit/auth", () => ({
  authRateLimiter: new RateLimiterMemory({ points: 2, duration: 60 }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("handleAuthRequest", () => {
  it("returns JSON 429 when sign-in rate limit is exceeded", async () => {
    const request = (path: string) =>
      new Request(`http://localhost${path}`, { method: "POST" });

    await handleAuthRequest(request("/api/auth/sign-in/email"));
    await handleAuthRequest(request("/api/auth/sign-in/email"));

    const response = await handleAuthRequest(
      request("/api/auth/sign-in/email"),
    );

    await expect(response.json()).resolves.toEqual({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests",
    });
    expect(response.status).toBe(429);
    expect(authHandlerMock).toHaveBeenCalledTimes(2);
  });

  it("does not rate limit non-sensitive POST paths", async () => {
    const response = await handleAuthRequest(
      new Request("http://localhost/api/auth/sign-out", { method: "POST" }),
    );

    expect(response.status).toBe(200);
    expect(authHandlerMock).toHaveBeenCalledTimes(1);
  });
});
