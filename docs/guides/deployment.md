# Deployment

This project is designed to deploy to a VPS with Coolify managing Docker Compose and Traefik.

## Coolify and Traefik

Coolify connects to the VPS, pulls the repository, builds the app image, runs the Compose services, and manages environment variables through its UI. Traefik is the reverse proxy Coolify uses for domain routing and TLS certificates.

Do not commit production secrets. Configure them in Coolify.

## Compose files

`docker-compose.yml` is for local development. It exposes Postgres, Redis, Mailpit, and the app to local ports.

`docker-compose.prod.yml` is for production. It contains:

- `app` built from `docker/Dockerfile`
- `postgres` with a named volume
- `redis` with a named volume
- an app health check against `/api/health`
- no Mailpit service
- no public `ports` mappings

Coolify/Traefik handles public HTTP and HTTPS exposure from the domain settings in the Coolify UI. Manual Traefik labels are not required for the common Coolify path.

`VITE_SENTRY_DSN` and `VITE_GA_MEASUREMENT_ID` are passed as Docker build args because Vite inlines `VITE_*` variables into the browser bundle during `pnpm build`. Set them before building, not only at runtime.

## Deployment flow

1. Push the branch to GitHub.
2. Create or update the Coolify project to use this repository.
3. Select `docker-compose.prod.yml` as the production Compose file.
4. Set the production environment variables in Coolify.
5. Deploy. Coolify pulls the code, builds the image, runs migrations on container start, and starts the services.

## Health checks

The production Compose file checks:

```text
GET /api/health
```

The endpoint returns `{ "status": "ok" }`. A healthy app container means the server is responding inside the Docker network; it does not prove that external DNS, TLS, SMTP, OpenAI, Sentry, or GA4 are configured correctly.

## Production environment checklist

Set these in Coolify:

- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_URL` if you override the internal Compose default
- `REDIS_URL` if you use managed Redis instead of the Compose Redis service
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `EMAIL_FROM`
- `AI_API_KEY` optional; required only to enable chat
- `AI_MODEL` optional; required only to enable chat
- `AI_BASE_URL` optional; use `https://openrouter.ai/api/v1` for OpenRouter
- `OPENAI_API_KEY` optional legacy fallback for `AI_API_KEY`
- `SENTRY_DSN` optional, recommended
- `VITE_SENTRY_DSN` optional, recommended; usually the same value as `SENTRY_DSN`
- `VITE_GA_MEASUREMENT_ID` optional

Use `BETTER_AUTH_URL` with the final HTTPS domain, for example `https://app.example.com`.
If AI config is omitted, the app still runs and chat shows a disabled-state message.
