# TanStack Start Server Primitives

If you are thinking in Next.js terms, "server actions" is not the right primary term here.

In current TanStack Start docs, the relevant concepts are:

- **Server Functions** via `createServerFn(...)`
- **Server Routes** via `createFileRoute(...){ server: { handlers } }`

This repo uses both.

## What this repo actually uses

### 1. Server Function

`src/routes/_authed.tsx` defines:

```ts
const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  return auth.api.getSession({ headers: request.headers });
});
```

That function is then called from `beforeLoad` to gate private routes.

This is the TanStack Start equivalent of "run server-only logic, but let route code call it as if it were a normal function".

### 2. Server Routes

This repo exposes three server routes:

- `src/routes/api/auth/$.ts`
- `src/routes/api/trpc/$.ts`
- `src/routes/api/chat.ts`

These are raw HTTP entrypoints built with `server.handlers`.

Examples:

- `/api/auth/$` mounts better-auth's handler
- `/api/trpc/$` mounts the tRPC fetch adapter
- `/api/chat` handles streamed AI responses with custom auth and rate limiting

## When to use which primitive

Use a **Server Function** when:

- the caller is inside your TanStack app
- you want a typed call boundary
- you do not need to manually shape a `Response`
- the logic feels like "call a server-only function from route code"

Use a **Server Route** when:

- you need raw `Request` and `Response`
- you are mounting a protocol adapter or library handler
- you need streaming or low-level HTTP behavior
- the endpoint is not just an internal function call

Use **tRPC** when:

- you are adding app-level typed query/mutation endpoints
- the client should consume them through `trpc.*`
- the feature fits the module pattern in `src/modules/*`

## Server Function details

The important property of `createServerFn` is not the syntax. It is the execution boundary.

Code inside the `.handler(...)` runs on the server and can safely access:

- request headers
- database clients
- secrets and env vars
- server-only SDKs

In this repo, `getRequest()` is used inside the server function to access request headers and read the auth session.

That makes `_authed.tsx` a route-level auth gate without putting session parsing in browser code.

## Server Routes details

Server routes are defined directly on a file route:

```ts
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return new Response("...");
      },
    },
  },
});
```

That is a better fit than `createServerFn` when you need direct HTTP control.

In this repo:

- `/api/chat` validates the session, rate-limits by user id, parses JSON, streams AI output, and persists messages.
- `/api/trpc/$` delegates GET and POST to `fetchRequestHandler(...)`.
- `/api/auth/$` hands the request to better-auth unchanged.

## Important security constraint

A route guard is not enough.

TanStack Router's `beforeLoad` protects the UI route tree. It does not make your server function or HTTP handler automatically safe.

So each server boundary still needs its own auth enforcement:

- `protectedProcedure` for tRPC
- `auth.api.getSession(...)` in raw handlers
- explicit checks inside server functions if they return protected data

This repo already does that correctly for tRPC and `/api/chat`.

## Practical decision rule for this repo

If you are adding new server-side behavior, choose like this:

- Need a new page-only auth/data helper: start with `createServerFn`
- Need a new app endpoint used from React Query hooks: add a tRPC procedure
- Need a webhook, streaming endpoint, file upload, auth callback, or library adapter: add a server route

## One architectural note

This repo currently uses:

- better-auth client methods for sign-in
- tRPC for register/resend verification
- raw server routes for auth mounting and AI chat streaming

That mix is valid, but it means "server-side behavior" is intentionally split across three primitives. Do not assume one abstraction owns everything.

## Useful references

- TanStack Start server functions: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- TanStack Start server routes: https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
