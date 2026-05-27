# CLAUDE.md

## Commands

```bash
pnpm dev           # Start dev server (http://localhost:3000)
pnpm build         # Production build
pnpm start         # Run production build

pnpm tsc           # Type check (no emit)
pnpm check         # Biome lint + format check
pnpm format        # Auto-format with Biome

pnpm test          # Watch mode
pnpm test --run    # Single run (use this in CI / before committing)

pnpm db:migrate    # Create + apply dev migration
pnpm db:deploy     # Apply migrations in production
pnpm db:studio     # Open Prisma Studio
pnpm db:seed       # Seed database
pnpm db:auth-schema  # Regenerate Better Auth tables in schema
```

After any Prisma schema change, run `pnpm prisma generate` before running TypeScript.

## Environment Setup

Copy `.env.example` to `.env`. Run `docker compose up -d` to start Postgres, Redis, and Mailpit (local SMTP on port 1025, UI on port 8025).

Required vars: `DATABASE_URL`, `REDIS_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `OPENAI_API_KEY`.

Optional observability vars: `SENTRY_DSN`, `VITE_SENTRY_DSN`, `VITE_GA_MEASUREMENT_ID`.

## Architecture

```
src/
  shared/          # Singletons and infrastructure (no business logic)
    auth/          # better-auth instance
    db/            # Prisma client singleton
    redis/         # ioredis client singleton
    ai/            # Vercel AI SDK openai client
    mail/          # Nodemailer transport + sendEmail()
    rate-limit/    # Redis-backed rate limiters (auth, chat)
    logger/        # pino logger singleton
    sentry/        # Sentry server + client initialization
    trpc/          # tRPC init, context, root router
  modules/         # Feature modules — each owns schema, service, router, tests
    auth/
    user/
    chat/
  routes/          # TanStack file-based routes
    __root.tsx     # HTML shell
    index.tsx      # Landing page
    _authed.tsx    # Auth guard layout — redirects to /login if no session
    (auth)/        # Public auth pages (login, register, verify-email)
    _authed/       # Protected pages (chat, profile)
    api/           # Server-only API handlers
      auth/$.ts    # better-auth handler
      trpc/$.ts    # tRPC fetch handler
      chat.ts      # AI streaming endpoint
  components/
    ui/            # shadcn/ui primitives (Radix-based)
    layout/        # App-level layout components (Navbar)
  lib/
    trpc.ts        # createTRPCReact client
    auth-client.ts # better-auth browser client
  test/
    setup.ts       # Vitest global mocks (Prisma, Redis, rate limiters)
```

## Adding a Feature

Follow the module pattern used by `auth`, `user`, and `chat`:

1. **`src/modules/<name>/schema.ts`** — Zod input schemas
2. **`src/modules/<name>/service.ts`** — Pure functions that call `prisma.*`; no tRPC context
3. **`src/modules/<name>/router.ts`** — tRPC router; use `protectedProcedure` for auth-required endpoints
4. **`src/shared/trpc/router.ts`** — Add the new router to `appRouter`
5. **`src/routes/_authed/<name>.tsx`** — Route that calls `trpc.<name>.*`

For server-only API handlers (streaming, webhooks): `src/routes/api/<name>.ts` using `createFileRoute` with `server.handlers`.

## tRPC Procedure Types

| Procedure | When to use |
|-----------|-------------|
| `publicProcedure` | No auth required |
| `protectedProcedure` | Requires session; `ctx.user` is non-null |
| `authRateLimitedProcedure` | IP-rate-limited; used for auth mutations |

Protected procedures pass `ctx.user` as non-nullable downstream — use `ctx.user.id` directly.

## Auth Guard

`src/routes/_authed.tsx` runs `getServerSession()` via `createServerFn` in `beforeLoad`. Any route nested under `/_authed/*` is automatically protected and redirects unauthenticated users to `/login`.

## Testing

- Unit tests live **next to the file they test** (`service.test.ts` beside `service.ts`)
- `src/test/setup.ts` provides global mocks via Vitest's `setupFiles`; all tests share these mocks (Prisma, Redis, rate limiters are memory-backed)
- E2E tests go in a separate directory (not yet set up)
- Use `vi.mocked(...)` to set return values per test; mocks are auto-reset between tests

```ts
vi.mocked(prisma.conversation.create).mockResolvedValueOnce(fake as never);
```

## Key Conventions

- **Imports**: use `@/` alias (maps to `src/`), never relative paths crossing module boundaries
- **Zod + react-hook-form**: cast schema as `any` in `zodResolver` if resolver generics drift from schema types.
- **Components**: All React components live under `src/components/`. Never define a reusable component inside `src/routes/` — routes are for pages only. Use `ui/` for shadcn primitives, `layout/` for app-wide layout, and `<feature>/` subdirectories (e.g., `chat/`) for feature-specific components. Each component file exports one component as a `default export` using a `function` declaration (not an arrow function). See `docs/guides/component-creation.md`.
- **CSS**: Tailwind v4 (`@import "tailwindcss"`) — `globals.css` is excluded from Biome
- **Biome**: 2-space indent, double quotes, trailing commas. Run `pnpm format` to auto-fix; unsafe fixes (bracket notation → dot notation) apply manually
- **No comments** unless the why is non-obvious

## Guides

Detailed references in `docs/guides/`. Read these before working on the relevant area:

- **`docs/guides/application-architecture.md`** — ViewModel pattern, three-layer architecture (Route/View, ViewModel, Components), data flow, naming conventions, and rules. **START HERE when building new pages.**
- `docs/guides/environment-setup.md` — env vars, Docker services, how variables are consumed, production notes
- `docs/guides/observability.md` — logging with pino, Sentry error tracking, health endpoint
- `docs/guides/analytics.md` — GA4 setup and conditional script injection
- `docs/guides/deployment.md` — Coolify + Traefik deployment, `docker-compose.prod.yml`
- `docs/guides/email-setup.md` — local Mailpit setup, production SMTP providers (Resend, Postmark, SendGrid, SES), trustedOrigins gotcha
- `docs/guides/auth-architecture.md` — how better-auth wiring works, `api/auth/$.ts` wildcard, `auth.api.*` vs `auth.handler()`, auth service layer
- `docs/guides/tanstack-start-routing-auth.md` — file-based routing conventions, auth guard layout, public vs private routes
- `docs/guides/tanstack-start-server-primitives.md` — when to use `createServerFn` vs `server.handlers` vs tRPC
- `docs/guides/trpc-new-endpoints.md` — step-by-step: schema → service → router → register
- `docs/guides/component-creation.md` — component placement rules, one-per-file convention, directory map

## Gotchas

- **Prisma v7**: `url` is removed from `datasource` in `schema.prisma`; it lives in `prisma.config.ts` for CLI commands and `@prisma/adapter-pg` in `src/shared/db/prisma.ts` for runtime. Never add `datasourceUrl` to `new PrismaClient()`.
- **Vercel AI SDK v6**: `useChat` uses `DefaultChatTransport`, `sendMessage({ text })`, and `UIMessage` with `parts[]`. The old `handleSubmit`/`input`/`handleInputChange` API is gone.
- **TanStack Start v1**: server API routes use `createFileRoute` with `server.handlers`. `createServerFn` imports from `@tanstack/react-start`, `getRequest()` from `@tanstack/react-start/server`.
- **`routeTree.gen.ts`**: auto-generated by the dev/build server. The checked-in file is a stub; it gets overwritten on `pnpm dev` or `pnpm build`. Do not edit it manually.
- **TypeScript 6**: `baseUrl` is deprecated; `"ignoreDeprecations": "6.0"` is set in `tsconfig.json`.
- **Sentry DSN**: Two env vars are needed if both sides are enabled: `SENTRY_DSN` for server-side code and `VITE_SENTRY_DSN` for the browser bundle. Vite exposes `VITE_*` variables to the client.
