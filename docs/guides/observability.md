# Observability

This app uses three low-overhead observability layers: structured logs, Sentry error tracking, and a health endpoint.

## Structured logging

The shared logger lives at `src/shared/logger/index.ts` and exports a single pino instance.

```ts
import { logger } from "@/shared/logger";

const moduleLogger = logger.child({ module: "my-module" });
moduleLogger.info({ userId }, "Created resource");
```

Use `logger.child({ module: "<name>" })` in feature code instead of `console.log`. Production logs are JSON so Docker, Coolify, Traefik, and log aggregation tools can parse them. Development logs use `pino-pretty` automatically when `NODE_ENV !== "production"`.

Set `LOG_LEVEL` when you need to override the default. The default is `debug` in development and `info` in production.

## tRPC request logs

`src/shared/trpc/init.ts` wraps all exported procedures in logging middleware. It records:

- procedure `path`
- `durationMs`
- authenticated `userId`, when present
- `outcome` as `success` or `error`

`src/shared/trpc/context.ts` adds `startTime` once per request so batched tRPC calls can share request timing context.

## Prisma logs

`src/shared/db/prisma.ts` configures Prisma logs with `emit: "event"` and forwards query, warning, and error events through pino. Query logs are emitted at `debug`, so they are visible in development by default and suppressed in production unless `LOG_LEVEL=debug`.

Prisma query logs may include SQL and parameter values. Do not enable debug query logs in production unless you are comfortable with that data appearing in application logs.

## Sentry

Server initialization lives in `src/shared/sentry/server.ts` and reads `SENTRY_DSN`. Client initialization lives in `src/shared/sentry/client.ts` and reads `VITE_SENTRY_DSN`.

The tRPC fetch handler captures unexpected procedure errors in `src/routes/api/trpc/$.ts`. It filters:

- `UNAUTHORIZED`
- `TOO_MANY_REQUESTS`
- `BAD_REQUEST`

Those codes usually represent expected user or client behavior rather than application defects. The `/api/chat` route captures stream setup failures and returns a generic 500 response.

On the frontend, `src/routes/__root.tsx` wraps the app outlet with `Sentry.ErrorBoundary`.

## Health endpoint

`GET /api/health` is implemented in `src/routes/api/health.ts` and returns:

```json
{ "status": "ok" }
```

`docker-compose.prod.yml` uses this endpoint for the app container health check. Coolify can use the same path to determine whether the service is ready.
