import type { RateLimiterAbstract } from "rate-limiter-flexible";
import { auth } from "@/lib/server/auth/better-auth";
import { prisma } from "@/lib/server/db/prisma";
import { authRateLimiter } from "@/lib/server/rate-limit/auth";
import { redis } from "@/lib/server/redis/client";
import { getClientIp } from "@/lib/server/request-ip";

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
  const ip = getClientIp(request);
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
