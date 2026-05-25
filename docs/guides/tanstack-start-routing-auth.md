# TanStack Start Routing and Auth

This repo uses TanStack Start's file-based routing on top of TanStack Router. The route tree is generated from `src/routes/` into `src/routeTree.gen.ts`, then mounted in `src/router.tsx`.

## The actual route structure

Relevant files:

- `src/routes/__root.tsx`
- `src/routes/index.tsx`
- `src/routes/(auth)/login.tsx`
- `src/routes/(auth)/register.tsx`
- `src/routes/(auth)/verify-email.tsx`
- `src/routes/_authed.tsx`
- `src/routes/_authed/profile.tsx`
- `src/routes/_authed/chat/index.tsx`
- `src/routes/_authed/chat/$conversationId.tsx`
- `src/routes/api/auth/$.ts`
- `src/routes/api/trpc/$.ts`
- `src/routes/api/chat.ts`

How those filenames behave:

- `__root.tsx` is the root document shell. It always renders.
- `index.tsx` is the `/` route.
- `(auth)/...` is a route group. The parentheses keep the folder out of the URL.
- `_authed.tsx` is a pathless layout route. The `_` prefix keeps it out of the URL but lets it wrap child routes.
- `$conversationId.tsx` is a dynamic segment.
- `api/...` files are still routes, but they expose server handlers instead of React pages.

The important consequence is this:

- `src/routes/(auth)/login.tsx` maps to `/login`
- `src/routes/_authed/profile.tsx` maps to `/profile`
- `src/routes/_authed/chat/$conversationId.tsx` maps to `/chat/:conversationId`

`(auth)` is organization only. It does not make a route public, guest-only, or auth-aware by itself.

## Where auth is actually enforced

Private page access is enforced in `src/routes/_authed.tsx`:

```ts
const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  return auth.api.getSession({ headers: request.headers });
});

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    const session = await getServerSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  component: () => <Outlet />,
});
```

That means every route nested under `_authed` is protected at route-load time.

Current public pages:

- `/`
- `/login`
- `/register`
- `/verify-email`

Current private pages:

- `/profile`
- `/chat`
- `/chat/:conversationId`

## Public vs private routes

If you want a page to be public, keep it outside `_authed`.

Example:

```text
src/routes/about.tsx        -> /about
src/routes/pricing.tsx      -> /pricing
src/routes/(auth)/login.tsx -> /login
```

If you want a page to require a logged-in user, put it under `_authed`.

Example:

```text
src/routes/_authed/settings.tsx         -> /settings
src/routes/_authed/billing.tsx          -> /billing
src/routes/_authed/projects/$id.tsx     -> /projects/:id
```

Minimal protected page:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return <div>Private page</div>;
}
```

You do not need to re-check auth in the page component if the page is already under `_authed`. The layout gate handles page access.

## Client auth vs server auth

This repo uses two different auth access patterns:

1. Server-side enforcement:
   - `auth.api.getSession({ headers: request.headers })`
   - used in `_authed.tsx`, tRPC context, and API handlers
2. Client-side session state:
   - `authClient.useSession()`
   - useful for UI only

Do not confuse them.

`authClient.useSession()` is not authorization. It is a convenience for rendering UI. Real protection happens on the server.

## API and RPC auth are separate from route auth

This is the mistake people make with TanStack Router: a route guard protects the page tree, not every server entrypoint.

This repo correctly enforces auth again at the server boundary:

- tRPC protected endpoints use `protectedProcedure` in `src/shared/trpc/init.ts`
- `/api/chat` checks `auth.api.getSession(...)` directly
- `/api/auth/$` delegates to better-auth's handler

So the model is:

- page access: `_authed.tsx`
- typed RPC access: `protectedProcedure`
- raw HTTP endpoints: explicit session checks in the handler

You need all three where appropriate.

## How to add a new public auth-related page

If the page should be publicly reachable, add it under `src/routes/(auth)/`.

Example:

```text
src/routes/(auth)/forgot-password.tsx -> /forgot-password
```

That keeps auth screens grouped without adding `/auth` to the URL.

If the page should be guest-only, this repo does not currently have a guest-only layout. You would need to add one explicitly, for example `_guest.tsx`, and redirect authenticated users away inside its `beforeLoad`.

## How to add a new private section

1. Create the route under `src/routes/_authed/...`
2. Use `trpc.*` or a server route for data
3. Enforce server-side auth again in any endpoint the page calls

Example:

```text
src/routes/_authed/projects/index.tsx
src/routes/_authed/projects/$projectId.tsx
src/modules/project/schema.ts
src/modules/project/service.ts
src/modules/project/router.ts
```

## Notes specific to this repo

- `src/router.tsx` wires TanStack Router, React Query, and the tRPC client together.
- Protected pages currently fetch data with `trpc.*.useQuery()` after the route loads.
- Login currently uses `authClient.signIn.email(...)` directly, while register/resend verification go through tRPC. That split works, but it is not conceptually uniform.

## Useful references

- TanStack Start routing: https://tanstack.com/start/latest/docs/framework/react/guide/routing
- TanStack Router file naming conventions: https://tanstack.com/router/v1/docs/framework/react/routing/file-naming-conventions
- TanStack Router authenticated routes: https://tanstack.com/router/latest/docs/guide/authenticated-routes
