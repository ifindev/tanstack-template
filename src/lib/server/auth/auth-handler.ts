import { auth } from "@/lib/server/auth/better-auth";
import { authRateLimiter } from "@/lib/server/rate-limit/auth";
import { getClientIp } from "@/lib/server/request-ip";

const RATE_LIMITED_AUTH_SUFFIXES = [
  "/sign-in/email",
  "/sign-up/email",
] as const;

function isRateLimitedAuthPath(pathname: string): boolean {
  return RATE_LIMITED_AUTH_SUFFIXES.some((suffix) => pathname.endsWith(suffix));
}

export async function handleAuthRequest(request: Request): Promise<Response> {
  if (request.method === "POST") {
    const pathname = new URL(request.url).pathname;
    if (isRateLimitedAuthPath(pathname)) {
      const ip = getClientIp(request) ?? "unknown";
      try {
        await authRateLimiter.consume(ip);
      } catch {
        return Response.json(
          { code: "TOO_MANY_REQUESTS", message: "Too many requests" },
          { status: 429 },
        );
      }
    }
  }

  return auth.handler(request);
}
