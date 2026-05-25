import { initTRPC, TRPCError } from "@trpc/server";
import { logger } from "@/shared/logger";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();
const trpcLogger = logger.child({ module: "trpc" });
const loggedProcedure = t.procedure.use(async ({ ctx, next, path }) => {
  const startedAt = Date.now();
  const result = await next();
  const durationMs = Date.now() - (ctx.startTime ?? startedAt);
  const logContext = {
    path,
    durationMs,
    userId: ctx.user?.id,
  };

  if (result.ok) {
    trpcLogger.info({ ...logContext, outcome: "success" });
  } else {
    trpcLogger.error(
      { ...logContext, outcome: "error", error: result.error },
      result.error.message,
    );
  }

  return result;
});

export const router = t.router;
export const publicProcedure = loggedProcedure;

export const protectedProcedure = loggedProcedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session: ctx.session, user: ctx.user } });
});

export const authRateLimitedProcedure = loggedProcedure.use(
  async ({ ctx, next }) => {
    const ip = ctx.ip ?? "unknown";
    try {
      await ctx.authRateLimiter.consume(ip);
    } catch {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests",
      });
    }
    return next();
  },
);
