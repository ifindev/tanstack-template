# AGENTS.md

Architectural reference for AI coding agents working in this codebase.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start v1 (Vinxi/Vite) + TanStack Router |
| UI | React 19, Tailwind CSS v4, shadcn/ui (Radix primitives) |
| API | tRPC v11 over HTTP batch |
| Auth | better-auth v1.6 (email/password + email verification) |
| Database | PostgreSQL 16, Prisma ORM v7 |
| Cache / Rate-limit | Redis (ioredis), rate-limiter-flexible |
| AI | Vercel AI SDK v6, @ai-sdk/openai (gpt-4o-mini) |
| Logging | pino |
| Error tracking | Sentry (frontend + backend) |
| Analytics | Google Analytics 4 |
| Forms | react-hook-form v7 + Zod v4 |
| Testing | Vitest |
| Linting | Biome v2 |

## Directory Map

```
src/
  shared/        Infrastructure singletons — import from here, never instantiate elsewhere
    logger/      pino singleton; use logger.child({ module }) per feature
    sentry/      Sentry server and client init files
  modules/       Feature modules — each is self-contained (schema + service + router + tests)
  routes/        File-based routes (TanStack Router convention)
  components/    React components
    ui/          shadcn/ui primitives — do not modify these directly
    layout/      App-wide layout components
  lib/           Thin client wrappers (tRPC client, auth client)
  test/          Shared Vitest setup only (global mocks)
```

## Module Pattern

Every feature follows the same four-file structure:

```
src/modules/<feature>/
  schema.ts    Zod schemas for all inputs
  service.ts   Pure async functions — takes primitives, calls prisma.*, returns data
  router.ts    tRPC router — calls service functions, handles tRPC errors
  *.test.ts    Tests co-located with the file they test
```

**Service functions** must not reference tRPC context or HTTP. They take plain arguments (`userId: string`, etc.) and return plain data. This makes them independently testable.

**Routers** extract `ctx.user.id` and validated `input`, then call the service. They own error mapping to `TRPCError`.

To wire a new module: add its router to `src/shared/trpc/router.ts`:
```ts
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  chat: chatRouter,
  myFeature: myFeatureRouter,  // add here
});
```

## tRPC Procedure Reference

Defined in `src/shared/trpc/init.ts`:

- **`publicProcedure`** — no auth check
- **`protectedProcedure`** — throws `UNAUTHORIZED` if no session; downstream `ctx.user` and `ctx.session` are non-null
- **`authRateLimitedProcedure`** — IP-based rate limit (10 req/60s via Redis); use for login/register/resend

```ts
// Protected mutation example
myRouter.doSomething: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return myService.doSomething(ctx.user.id, input.id);
  }),
```

## Route Conventions

File-based routing via TanStack Router:

| Pattern | Purpose |
|---------|---------|
| `__root.tsx` | HTML shell with `<Scripts />`, `<ScrollRestoration />` |
| `index.tsx` | Public landing page |
| `_authed.tsx` | Layout that enforces auth; all children are protected |
| `_authed/<page>.tsx` | Protected pages — use `trpc.*` for data |
| `(auth)/<page>.tsx` | Public auth pages (parentheses = pathless group) |
| `api/<name>.ts` | Server-only handlers (no React component) |

Protected routes sit under `src/routes/_authed/`. The `_authed.tsx` layout runs `getServerSession()` in `beforeLoad` and redirects to `/login` if there's no session.

API routes use `server.handlers`:
```ts
export const Route = createFileRoute("/api/my-endpoint")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // server-only, no React
        return new Response(...);
      },
    },
  },
});
```

## Client Data Fetching

Always use `trpc.*` from `src/lib/trpc.ts` for queries and mutations:

```ts
// Query
const { data } = trpc.chat.listConversations.useQuery({ limit: 20 });

// Mutation
const mutation = trpc.chat.createConversation.useMutation({
  onSuccess: (result) => { /* navigate, invalidate cache, etc. */ },
});
mutation.mutate({ title: "New chat" });
```

For AI streaming, the `/api/chat` route uses Vercel AI SDK's `streamText` + `toUIMessageStreamResponse()`. The client uses `useChat` from `@ai-sdk/react` with `DefaultChatTransport`:

```ts
const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({ api: "/api/chat", body: { conversationId } }),
  id: conversationId,
});
sendMessage({ text: inputValue });
```

Messages have a `parts` array — extract text with:
```ts
msg.parts.filter((p): p is { type: "text"; text: string } => p.type === "text")
         .map((p) => p.text).join("")
```

## Auth Patterns

**Server-side session check** (in server functions or API handlers):
```ts
const sessionData = await auth.api.getSession({ headers: request.headers });
if (!sessionData?.user) return new Response("Unauthorized", { status: 401 });
```

**Client-side** (for UI state only — never trust for authorization):
```ts
import { authClient } from "@/lib/auth-client";
const { data: session } = authClient.useSession();
```

**tRPC route guard**: use `protectedProcedure` — do not re-check auth inside service functions.

## Database

Schema: `prisma/schema.prisma`. Prisma v7: the `datasource` block has no `url` field — the URL comes from `prisma.config.ts` at CLI time and `DATABASE_URL` env at runtime through `@prisma/adapter-pg`.

After any schema change:
1. `pnpm db:migrate` to create and apply the migration
2. `pnpm prisma generate` to regenerate the client types

All DB access goes through the singleton in `src/shared/db/prisma.ts`. Never instantiate `PrismaClient` elsewhere.

## Adding UI Components

**Read `docs/guides/component-creation.md` before creating any new component.**

All React components live under `src/components/`. Never define a reusable component inside `src/routes/` — route files are for pages only (the `Route` export and its single page component).

| Directory | Purpose |
|-----------|---------|
| `src/components/ui/` | shadcn/ui primitives — do not modify or add files here manually |
| `src/components/layout/` | App-wide layout components shared across features |
| `src/components/<feature>/` | Feature-specific components (e.g., `chat/`, `dashboard/`) |

Each component file must:
- Export **one** React component as a **`default export`**
- Use a **`function` declaration**, not an arrow function
- Named exports for types and utility functions in the same file are fine

```tsx
// correct
export default function ConversationPanel({ ... }: ConversationPanelProps) {
  return ...;
}
```

Use existing shadcn/ui primitives from `src/components/ui/` (Button, Input, Card, etc.). Always use the `cn()` utility from `src/lib/utils.ts` for conditional class merging.

## Testing

- Test files live **next to the file they test**: `service.test.ts` beside `service.ts`
- `src/test/setup.ts` mocks Prisma, Redis, and rate limiters globally for all tests
- Rate limiters are swapped for in-memory variants — no Redis required to run tests
- Use `vi.mocked(...).mockResolvedValueOnce(...)` to set per-test return values
- Run: `pnpm test --run`

## Logging

Always use `logger.child({ module: "<name>" })` from `@/shared/logger`; do not use `console.log` in application code. Server logs are structured JSON in production and pretty output in development automatically.

## Environment Variables

See `.env.example`. Local infrastructure (`DATABASE_URL`, `REDIS_URL`, SMTP) is provided by `docker compose up -d`.

## Guides

Detailed architectural references in `docs/guides/`. Consult these when the relevant area is in scope:

| Guide | When to read |
|-------|-------------|
| **`docs/guides/application-architecture.md`** | **START HERE** when building new pages: three-layer ViewModel pattern (Route Views, ViewModel hooks, Pure components) |
| `docs/guides/environment-setup.md` | Setting up the project for the first time, configuring env vars, or understanding local infrastructure |
| `docs/guides/observability.md` | Working with pino logging, Sentry error tracking, or the health endpoint |
| `docs/guides/analytics.md` | Configuring GA4 or changing analytics script injection |
| `docs/guides/deployment.md` | Deploying with Coolify + Traefik or editing `docker-compose.prod.yml` |
| `docs/guides/email-setup.md` | Configuring email for local dev (Mailpit) or production (Resend, Postmark, SendGrid, SES) |
| `docs/guides/auth-architecture.md` | Working on auth flows, the `api/auth/$.ts` route, better-auth integration, or `src/modules/auth/` |
| `docs/guides/tanstack-start-routing-auth.md` | Adding or modifying routes, auth guards, public vs private pages |
| `docs/guides/tanstack-start-server-primitives.md` | Choosing between `createServerFn`, `server.handlers`, and tRPC for a new server-side behavior |
| `docs/guides/trpc-new-endpoints.md` | Adding a new tRPC module (schema → service → router → register) |
| `docs/guides/component-creation.md` | Creating or moving any React component |

## Commit Workflow

Use atomic conventional commits. Follow all rules below exactly.

### Commit format

```
<type>(<scope>): <imperative description under 72 chars>

- specific change made
- another specific change
```

Valid types: `feat` `fix` `refactor` `style` `test` `docs` `chore` `perf`

### Scope inference

Derive scope from the file path:

| Path | Scope |
|------|-------|
| `src/modules/<name>/` | `<name>` |
| `src/components/<name>/` | `<name>` (use `ui` for `components/ui/`) |
| `src/routes/(auth)/` | `auth` |
| `src/routes/_authed/<name>` | `<name>` |
| `src/routes/api/` | `api` |
| `src/routes/` root files | `routes` |
| `src/shared/<name>/` | `<name>` |
| `src/lib/` | `lib` |
| `prisma/` | `db` |
| `docs/`, `*.md` at root | `docs` |
| `package.json`, lock files | `deps` |
| Other root config | `config` |

### Atomicity rules

- Default: one file per commit.
- Group together only when in the same scope (max 3 files):
  - `schema.ts` + `service.ts` in the same module
  - Any `*.test.ts` / `*.test.tsx` with the source file it tests
- Never group files from different modules or scopes in one commit.
- Auto-generated files (`routeTree.gen.ts`, `pnpm-lock.yaml`) go in their own `chore` commits, executed last.

### Staging rules

- **Never** use `git add .` or `git add -A`.
- Stage files explicitly by name: `git add src/modules/chat/schema.ts src/modules/chat/service.ts`
- New (untracked), deleted, and renamed files must all be staged by explicit path.
- **Never** use `--no-verify`.

### Execution order

1. Run `git status --short` and `git diff HEAD` to enumerate all changed files.
2. Produce a written commit plan (list each commit with its files) before executing any commit.
3. Execute commits one by one in the planned order.
4. After all commits, print a one-line-per-commit summary with the short SHA and subject.
