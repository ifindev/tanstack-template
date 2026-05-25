# Environment Setup

## Quick start

```bash
cp .env.example .env
docker compose up postgres redis mailpit -d
pnpm db:migrate
pnpm dev
```

The app runs at `http://localhost:3000`. Mailpit (email previews) runs at `http://localhost:8025`.

## Environment variables

All variables live in a single `.env` file at the repo root. Copy `.env.example` to get started — the defaults work for local Docker-based development without modification, except for the two secrets marked required below.

| Variable | Required | Description | Default |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/tanstack_template` |
| `REDIS_URL` | Yes | Redis connection string | `redis://localhost:6379` |
| `BETTER_AUTH_URL` | Yes | Public base URL — used for auth callback links in emails | `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | Yes | Secret used to sign sessions (min 32 characters) | — |
| `OPENAI_API_KEY` | Yes | OpenAI API key for the AI chat feature | — |
| `SMTP_HOST` | No | SMTP server host | `localhost` |
| `SMTP_PORT` | No | SMTP server port | `1025` |
| `EMAIL_FROM` | No | From address on outbound emails | `noreply@example.com` |
| `SENTRY_DSN` | No | Sentry DSN for server-side error tracking | — |
| `VITE_SENTRY_DSN` | No | Same DSN, exposed to browser via Vite (`VITE_*` prefix) | — |
| `VITE_GA_MEASUREMENT_ID` | No | GA4 Measurement ID (e.g. `G-XXXXXXXXXX`); leave unset to disable | — |

`BETTER_AUTH_SECRET` and `OPENAI_API_KEY` have no defaults and must be set before the app can start.

## Local infrastructure via Docker

`docker-compose.yml` provides Postgres, Redis, and Mailpit. Run them before starting the dev server:

```bash
docker compose up postgres redis mailpit -d
```

| Service | Port | Purpose |
|---|---|---|
| Postgres | 5432 | Primary database |
| Redis | 6379 | Session cache and rate limiting |
| Mailpit | 1025 (SMTP), 8025 (UI) | Catches outbound emails in dev |

The default `DATABASE_URL` and `REDIS_URL` in `.env.example` point at these containers. No changes are needed for local development.

## Running the full stack in Docker

To build and run the application itself inside Docker:

```bash
docker compose up --build
```

The multi-stage `Dockerfile` is in `docker/`.

## How variables are consumed

- `DATABASE_URL` — read by `prisma.config.ts` at migration time, and at runtime by the Prisma Postgres adapter in `src/shared/db/prisma.ts`
- `REDIS_URL` — read by `src/shared/redis/client.ts`
- `BETTER_AUTH_URL` / `BETTER_AUTH_SECRET` — read by the better-auth instance at `src/shared/auth/better-auth.ts`
- `SMTP_HOST` / `SMTP_PORT` / `EMAIL_FROM` — read by the Nodemailer transport at `src/shared/mail/transport.ts`
- `OPENAI_API_KEY` — read by the Vercel AI SDK provider at `src/shared/ai/openai.ts`
- `SENTRY_DSN` — read by `src/shared/sentry/server.ts` at startup; never sent to the browser
- `VITE_SENTRY_DSN` — inlined into the browser bundle by Vite at build time. Use the same value as `SENTRY_DSN`; the separate name prevents accidentally treating a browser-exposed value as server-only. In Docker production builds, this must be passed as a build arg.
- `VITE_GA_MEASUREMENT_ID` — inlined into `src/routes/__root.tsx` at build time. If unset, no GA4 script is injected.

Only `VITE_*` variables are exposed to the browser. All non-`VITE_*` variables are consumed server-side.

## Production

For production deployments:

- Set `BETTER_AUTH_URL` to your real public domain (e.g. `https://myapp.com`).
- Use a strong random value for `BETTER_AUTH_SECRET` (at least 32 characters).
- Point `DATABASE_URL` and `REDIS_URL` at your managed Postgres and Redis instances.
- Point `SMTP_*` vars at a real SMTP provider (e.g. Resend, Postmark, SES).
- Set `SENTRY_DSN` and `VITE_SENTRY_DSN` to your Sentry project DSN. Set `VITE_GA_MEASUREMENT_ID` to your GA4 Measurement ID. All three are optional but recommended for production.
- Run `pnpm db:deploy` (not `db:migrate`) to apply migrations without creating new migration files.

## Related references

- [`README.md`](../../README.md) — project overview, quick start, full variable table
- [`CLAUDE.md`](../../CLAUDE.md) — all dev commands, architecture overview, key conventions
- [`AGENTS.md`](../../AGENTS.md) — architectural reference for the module pattern, tRPC procedures, route conventions, and data fetching
