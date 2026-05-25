import type { RateLimiterAbstract } from "rate-limiter-flexible";
import { auth } from "@/shared/auth/better-auth";
import { prisma } from "@/shared/db/prisma";
import { authRateLimiter } from "@/shared/rate-limit/auth";
import { redis } from "@/shared/redis/client";

// NonNullable ensures we index into the resolved object, not the union with null
type GetSessionResult = Awaited<ReturnType<typeof auth.api.getSession>>;
type AuthSessionData = NonNullable<GetSessionResult>;

export interface Context {
  session: AuthSessionData["session"] | null;
  user: AuthSessionData["user"] | null;
  prisma: typeof prisma;
  redis: typeof redis;
  authRateLimiter: RateLimiterAbstract;
  ip: string | null;
  startTime: number;
}

export async function createContext(request: Request): Promise<Context> {
  const sessionData = await auth.api.getSession({ headers: request.headers });
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  return {
    session: sessionData?.session ?? null,
    user: sessionData?.user ?? null,
    prisma,
    redis,
    authRateLimiter,
    ip,
    startTime: Date.now(),
  };
}
