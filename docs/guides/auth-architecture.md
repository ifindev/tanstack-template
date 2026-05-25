# Auth Architecture

This guide explains how better-auth is wired into this repo, what the `$.ts` wildcard route does, and when to use each auth access pattern.

## The `$.ts` catch-all wildcard

TanStack Router uses `$` as a catch-all segment in filenames. When `$` is the entire filename (not `$param`), it matches all remaining path segments including nested ones.

```
src/routes/api/auth/$.ts  →  matches /api/auth/*
src/routes/api/trpc/$.ts  →  matches /api/trpc/*
```

So `api/auth/$.ts` catches:

- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-up/email`
- `GET /api/auth/verify-email`
- `POST /api/auth/sign-out`
- `GET /api/auth/session`
- ...every other better-auth endpoint

The full original `Request` (including the complete URL path) is passed to the handler. This is why a single file can mount an entire library like better-auth or tRPC without enumerating every sub-path.

Compare to a dynamic segment like `$conversationId.tsx`, which captures one URL segment and exposes it as `params.conversationId`. The bare `$` does not expose params — it is a routing sink.

## The two ways `auth` is accessed

The `auth` object from `src/shared/auth/better-auth.ts` provides two distinct access patterns:

### 1. `auth.handler(request)` — HTTP gateway

Used in `src/routes/api/auth/$.ts`:

```ts
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
```

This delegates the entire raw `Request` to better-auth's built-in HTTP router. Better-auth inspects the URL, runs its own logic (hash passwords, write DB, send emails, set cookies), and returns a `Response`.

This is the path the browser-side auth client uses:

```ts
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({ baseURL: ... });
```

When you call `authClient.signIn.email(...)` in the browser, it makes a `POST /api/auth/sign-in/email` request, which hits `$.ts`, which calls `auth.handler(request)`.

### 2. `auth.api.*` — programmatic in-process API

Used in `src/modules/auth/service.ts`:

```ts
export async function registerUser(data) {
  return auth.api.signUpEmail({ body: data });
}

export async function loginUser(data) {
  return auth.api.signInEmail({ body: data });
}
```

This calls the same better-auth logic but without an HTTP round-trip. The call executes in-process on the server and returns typed data. It is used inside tRPC procedures where you need a typed result back.

## The auth service layer

`src/modules/auth/service.ts` is a thin wrapper around `auth.api.*`. It exists for the same reason all service files exist in this repo: to keep the tRPC router clean and to make the logic independently testable.

The auth tRPC router in `src/modules/auth/router.ts` calls these service functions. All three procedures use `authRateLimitedProcedure`.

## Why login bypasses tRPC

Login uses `authClient.signIn.email(...)` directly in the browser (`src/routes/(auth)/login.tsx`). This goes straight to `/api/auth/sign-in/email` via the `$.ts` handler.

Register and resend-verification go through tRPC instead:
- `trpc.auth.register` → `registerUser()` → `auth.api.signUpEmail()`
- `trpc.auth.resendVerification` → `resendVerificationEmail()` → `auth.api.sendVerificationEmail()`

The asymmetry is intentional: sign-in is a standard better-auth operation where the library's built-in session cookie management is the right layer. Register and resend go through tRPC because you may want tRPC-level error mapping, rate limiting via `authRateLimitedProcedure`, or typed responses.

This is not a bug. See `trpc-new-endpoints.md` for the rule: don't force everything through tRPC if better-auth already handles it correctly via `authClient`.

## Request flow summary

**Browser sign-in:**
```
authClient.signIn.email()
  → POST /api/auth/sign-in/email
  → api/auth/$.ts → auth.handler(request)
  → better-auth sets session cookie, returns response
```

**Browser register (via tRPC):**
```
trpc.auth.register.mutate()
  → POST /api/trpc/auth.register
  → api/trpc/$.ts → fetchRequestHandler → appRouter
  → authRateLimitedProcedure → auth/router.ts → registerUser()
  → auth.api.signUpEmail() → better-auth writes DB, sends email
```

**Session check in server-side code:**
```ts
const sessionData = await auth.api.getSession({ headers: request.headers });
```

Used in `_authed.tsx`, tRPC context, and raw API handlers like `/api/chat`.

## When adding new auth-related behavior

Ask in this order:

1. **Does better-auth already have a built-in endpoint for this?** Check the better-auth docs. If yes, it is already mounted at `/api/auth/$` — you just need to call it from `authClient.*` in the browser. No new code needed.

2. **Do you need a typed response in tRPC or rate limiting?** Add a procedure to `src/modules/auth/router.ts` that calls a new `auth.api.*` method via `src/modules/auth/service.ts`.

3. **Do you need raw HTTP control (webhooks, custom callbacks)?** Add a new server route.

Do not add a tRPC wrapper around something better-auth handles natively.

## Useful references

- better-auth API reference: https://www.better-auth.com/docs/reference/api
- TanStack Router catch-all routes: https://tanstack.com/router/v1/docs/framework/react/routing/file-naming-conventions#splat--catch-all-routes
