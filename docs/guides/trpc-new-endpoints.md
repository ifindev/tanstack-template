# Adding New tRPC Endpoints

This codebase uses a strict module pattern for tRPC. Follow it. It exists to keep transport, validation, and business logic separate.

Current tRPC foundation:

- `src/lib/server/trpc/init.ts`
- `src/lib/server/trpc/context.ts`
- `src/lib/server/trpc/router.ts`
- `src/lib/client/trpc.ts`
- `src/router.tsx`

Current feature routers:

- `src/modules/auth/auth.router.ts`
- `src/modules/user/user.router.ts`
- `src/modules/chat/chat.router.ts`

## The shape of a feature module

Each feature should live in:

```text
src/modules/<feature>/
  <feature>.schema.ts
  <feature>.service.ts
  <feature>.router.ts
  <feature>.*.test.ts
```

Responsibilities:

- `schema.ts`: Zod input schemas
- `service.ts`: pure async business logic with primitive arguments
- `router.ts`: tRPC procedure definitions, auth choice, and transport-level error mapping
- `*.test.ts`: tests next to the service or router they cover

The service layer must not depend on tRPC context or HTTP.

## How requests flow

1. Client calls `trpc.feature.endpoint.useQuery()` or `useMutation()`
2. `src/router.tsx` sends the request to `/api/trpc` through `httpBatchLink`
3. `src/routes/api/trpc/$.ts` passes the request into `fetchRequestHandler(...)`
4. `src/lib/server/trpc/context.ts` builds the context
5. The selected feature router runs
6. The router calls the feature service

That is the whole path.

## Step 1: Add or update the feature schema

Example:

```ts
// src/modules/project/project.schema.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
});
```

Keep schemas transport-facing. They validate what crosses the tRPC boundary.

## Step 2: Add the service function

Example:

```ts
// src/modules/project/project.service.ts
import { prisma } from "@/lib/server/db/prisma";

export async function createProject(userId: string, name: string) {
  return prisma.project.create({
    data: { userId, name },
  });
}
```

Take primitive arguments like `userId: string`, not a tRPC context object.

That rule matters. It keeps the service reusable and testable.

## Step 3: Add the router procedure

Pick the right procedure base from `src/lib/server/trpc/init.ts`:

- `publicProcedure`: no auth requirement
- `protectedProcedure`: requires `ctx.user` and `ctx.session`
- `authRateLimitedProcedure`: IP-based rate limiting for auth-sensitive endpoints

Example:

```ts
// src/modules/project/project.router.ts
import { protectedProcedure, router } from "@/lib/server/trpc/init";
import { createProjectSchema } from "./project.schema";
import { createProject } from "./project.service";

export const projectRouter = router({
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return createProject(ctx.user.id, input.name);
    }),
});
```

The router should do three things:

1. choose auth and middleware
2. validate input
3. translate transport concerns into service calls and tRPC errors

Do not move database logic from the service into the router.

## Step 4: Register the router

Wire the new feature into `src/lib/server/trpc/router.ts`:

```ts
import { projectRouter } from "@/modules/project/router";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  chat: chatRouter,
  project: projectRouter,
});
```

If you skip this step, the endpoint does not exist.

## Step 5: Use it from the client

`src/lib/client/trpc.ts` already exports the typed React client:

```ts
export const trpc = createTRPCReact<AppRouter>();
```

Once the router is registered, the client gets the new endpoint type automatically.

Examples:

```ts
const { data } = trpc.project.list.useQuery({ limit: 20 });

const createMutation = trpc.project.create.useMutation({
  onSuccess: () => {
    // invalidate, navigate, or update UI
  },
});
```

## Error handling rules in this repo

Use `TRPCError` in routers when you need to map domain failures to API semantics.

Current examples:

- auth router maps failures to `BAD_REQUEST` and `UNAUTHORIZED`
- `protectedProcedure` throws `UNAUTHORIZED`
- `authRateLimitedProcedure` throws `TOO_MANY_REQUESTS`

That means:

- services can throw normal errors
- routers decide which tRPC error code the client should see

## Context available to procedures

`src/lib/server/trpc/context.ts` provides:

- `session`
- `user`
- `prisma`
- `redis`
- `authRateLimiter`
- `ip`

Use the context sparingly in routers. If a dependency can live in a shared singleton or service import, prefer that over bloating the service signature with transport concerns.

## Testing expectations

Tests live next to the code they cover.

Typical pattern:

- mock Prisma or other shared singletons in `src/test/setup.ts`
- test service behavior directly
- add router-level tests only when transport behavior itself is non-trivial

Run:

```bash
pnpm test --run
```

## Notes specific to auth

Do not force everything through tRPC just because it is available.

This repo already uses better-auth directly for sign-in on the client:

- `authClient.signIn.email(...)` in `src/routes/(auth)/login.tsx`

By contrast, register and resend verification currently go through tRPC:

- `trpc.auth.register`
- `trpc.auth.resendVerification`

So when adding auth-related endpoints, first ask whether the behavior belongs in better-auth, tRPC, or a raw server route. Those are not interchangeable abstractions.
