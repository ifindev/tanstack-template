# TanStack Start Full-Stack Template

A production-ready full-stack template using TanStack Start, tRPC v11, better-auth, PostgreSQL, Prisma, Redis, and the Vercel AI SDK.

## AI Coding Workflow

The template ships with a lightweight, agent-driven workflow for taking a project from idea to working code with Claude Code or Codex. Three skills, two layers of docs, one tracker file.

| Skill | Purpose | Modes |
|---|---|---|
| `project-brief` | Draft / update `docs/project-brief.md` — the project's living truth | `create`, `update` |
| `feature-epic` | Draft a feature epic and its stories; keep `docs/trackers.md` in sync | `create <id>-<slug>`, `add-story <id>-<slug> <story>` |
| `execute-task` | Implement exactly one story end-to-end | `next`, `<id>-<slug>/<NN>-<story>` |

Read [`docs/ai-workflow/README.md`](docs/ai-workflow/README.md) for the full workflow, conventions, and examples. Filled-in references live under [`docs/_examples/`](docs/_examples/); empty starters under [`docs/_templates/`](docs/_templates/).

### Skill invocation

| Agent | Explicit invocation | Example |
|---|---|---|
| Codex | `$<skill-name>` | `$project-brief` |
| Claude Code | `/<skill-name>` | `/project-brief` |

Utility skills (`commit`, `create-pr`, `grill-me`, `grilling`) are kept alongside the workflow skills and are explicit-only.

### Shared skill source

Canonical skill bodies live in `.agents/skills/`. The `.claude/skills/` entries are symlinks pointing at the canonical source so both agents follow the same prompts.

When adding a new shared skill:

1. Create the real skill at `.agents/skills/<skill-name>/SKILL.md`.
2. Symlink: `ln -s ../../.agents/skills/<skill-name> .claude/skills/<skill-name>`.
3. Run `pnpm harness:validate`.

Do not duplicate skill bodies between trees.

### Start a new project

```bash
pnpm harness:new-project -- "Project Name"
pnpm harness:validate
```

Then:

1. Invoke `/project-brief` (Claude Code) or `$project-brief` (Codex). Describe the project conversationally. The skill suggests reasonable defaults, asks targeted questions for genuine ambiguity, and writes `docs/project-brief.md`.
2. For each feature row in the brief, invoke `/feature-epic create <id>-<slug>`. The skill drafts the epic and stories, appends to `docs/trackers.md`.
3. Invoke `/execute-task next` to build the first pending story. Repeat.

### Add a feature after MVP

1. Invoke `/project-brief` and describe the new feature. The skill updates the brief, then offers to draft the epic inline.
2. Continue with `/execute-task` once stories are drafted.

### Detailed references

- [Workflow guide and examples](docs/ai-workflow/README.md)
- [Repository architecture and agent rules](AGENTS.md)
- [Claude Code entry point](CLAUDE.md)

## Stack

- **Framework**: TanStack Start (Vite/Vinxi SSR)
- **Routing**: TanStack Router (file-based)
- **API**: tRPC v11 with React Query
- **Auth**: better-auth (email/password + email verification)
- **Database**: PostgreSQL via Prisma ORM
- **Cache/Rate-limit**: Redis (ioredis) + rate-limiter-flexible
- **AI**: Vercel AI SDK with OpenAI gpt-4o-mini
- **Logging**: pino
- **Error tracking**: Sentry (frontend + backend)
- **Analytics**: Google Analytics 4
- **Forms**: react-hook-form + Zod v4
- **UI**: shadcn/ui primitives + Tailwind CSS v4
- **Linting**: Biome
- **Testing**: Vitest
- **Dev infra**: Docker Compose (app + Postgres + Redis + Mailpit)

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

### Editor setup

VS Code and Cursor read the shared settings in `.vscode/`. It is recommended to install the Biome extension for this repository. When prompted, accept the recommended extension. JavaScript, TypeScript, JSX, TSX, JSON, and JSONC files will then use Biome as their default formatter, format on save, apply safe lint fixes, and organize imports.

If another formatter still runs, disable its workspace formatting for this
repository or accept Biome as the default formatter when the editor asks.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in your values
```

### 3. Start local services (Postgres, Redis, Mailpit)

```bash
docker compose up postgres redis mailpit -d
```

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Generate Prisma client

```bash
pnpm prisma generate
```

### 6. Start the dev server

```bash
pnpm dev
```

The app will be available at http://localhost:3000.
Mailpit UI (email previews) at http://localhost:8025.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/tanstack_template` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `BETTER_AUTH_URL` | Public URL for auth callbacks | `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | Secret for session signing (min 32 chars) | — |
| `SMTP_HOST` | SMTP server host | `localhost` |
| `SMTP_PORT` | SMTP server port | `1025` |
| `EMAIL_FROM` | From address for outbound emails | `noreply@example.com` |
| `AI_API_KEY` | AI provider API key; required only to enable chat | — |
| `AI_BASE_URL` | OpenAI-compatible provider base URL; omit for OpenAI | — |
| `AI_MODEL` | AI model id; required only to enable chat | — |
| `OPENAI_API_KEY` | Legacy fallback for `AI_API_KEY` | — |
| `SENTRY_DSN` | Sentry DSN for server-side error tracking (optional) | — |
| `VITE_SENTRY_DSN` | Same DSN exposed to the browser bundle (optional) | — |
| `VITE_GA_MEASUREMENT_ID` | GA4 Measurement ID; omit to disable analytics (optional) | — |

OpenAI example:

```env
AI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

OpenRouter example:

```env
AI_API_KEY=sk-or-...
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=openai/gpt-4o-mini
```

## Generate `BETTER_AUTH_SECRET`

`BETTER_AUTH_SECRET` is used by better-auth to sign session cookies and tokens. It must be a random string of at least 32 characters and must be kept secret — anyone with this value can forge sessions for your users.

Generate one with any of the following:

```bash
# Recommended: better-auth CLI
pnpm dlx @better-auth/cli secret

# OpenSSL (32 random bytes, base64-encoded)
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Paste the result into `.env` as `BETTER_AUTH_SECRET=...`. Use a different value in every environment (local, staging, production) and never commit it to git.


## Docker (full stack)

To run the entire stack in Docker:

```bash
docker compose up --build
```

## Project Structure

```
.
├── src/
│   ├── client.tsx            # Browser entry point
│   ├── router.tsx            # TanStack Router instance
│   ├── modules/
│   │   ├── auth/             # Auth schemas, service, tRPC router
│   │   ├── user/             # User profile schemas, service, tRPC router
│   │   ├── chat/             # Conversation/message schemas, service, tRPC router
│   │   └── config/           # Feature flag tRPC router (router-only, no schema/service)
│   ├── shared/
│   │   ├── db/               # Prisma client singleton
│   │   ├── redis/            # ioredis client
│   │   ├── auth/             # better-auth configuration
│   │   ├── trpc/             # tRPC init, context, root router
│   │   ├── ai/               # Vercel AI SDK / OpenAI provider + feature config
│   │   ├── rate-limit/       # Rate limiters (auth, chat)
│   │   ├── mail/             # Nodemailer transport
│   │   ├── logger/           # pino logger singleton
│   │   └── sentry/           # Sentry server and client initialization
│   ├── hooks/
│   │   ├── use-chat-session.ts  # Chat UI orchestration (useChat + scroll + tRPC)
│   │   ├── use-chat-scroll.ts   # Scroll position tracking for chat
│   │   └── use-mobile.ts        # Responsive breakpoint helper
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives (Button, Input, Card, Sidebar, etc.)
│   │   ├── layout/           # App-wide layout (AppSidebar, AuthShell, Brand, Editorial, Navbar)
│   │   └── chat/             # Chat UI components (ConversationPanel, ComposerArea, MessageMarkdown)
│   ├── routes/
│   │   ├── __root.tsx        # HTML shell with GA4 + Sentry error boundary
│   │   ├── index.tsx         # Public landing page
│   │   ├── (auth)/
│   │   │   ├── (login)/      # /login — view + view-model
│   │   │   ├── (register)/   # /register — view + view-model
│   │   │   └── (verify-email)/ # /verify-email — view + view-model
│   │   ├── _authed.tsx       # Auth guard + sidebar layout (SidebarProvider + AppSidebar)
│   │   ├── _authed/
│   │   │   ├── (profile)/    # /profile — view + view-model
│   │   │   └── chat/
│   │   │       ├── (list)/   # /chat — conversation list view + view-model
│   │   │       ├── (new)/    # /chat/new — new conversation view + view-model
│   │   │       └── (conversation)/ # /chat/:conversationId — view + view-model
│   │   └── api/
│   │       ├── auth/$.ts     # better-auth catch-all handler
│   │       ├── trpc/$.ts     # tRPC fetch handler
│   │       ├── chat.ts       # AI streaming endpoint (Vercel AI SDK)
│   │       └── health.ts     # Health check endpoint
│   ├── lib/
│   │   ├── utils.ts          # cn() helper
│   │   ├── trpc.ts           # tRPC React client
│   │   └── auth-client.ts    # better-auth browser client
│   ├── test/
│   │   └── setup.ts          # Vitest mocks (Prisma, Redis, rate limiters)
│   └── styles/
│       └── globals.css       # Tailwind v4 CSS variables + theme
├── prisma/
│   └── schema.prisma         # Database schema
├── docker/
│   └── Dockerfile            # Multi-stage production build
└── docker-compose.yml
```

## Development Commands

```bash
pnpm dev           # Start dev server
pnpm build         # Production build
pnpm start         # Start production server
pnpm test          # Run Vitest
pnpm check         # Biome lint + format check
pnpm format        # Biome auto-format
pnpm tsc           # TypeScript type check
pnpm db:migrate    # Run Prisma migrations (dev)
pnpm db:studio     # Open Prisma Studio
pnpm db:deploy     # Deploy migrations (production)
```

## Auth Flow

1. User registers at `/register` — verification email is sent via Mailpit (dev) or SMTP (prod)
2. User clicks the link in their email → `/verify-email?token=...` verifies the token
3. User logs in at `/login` — cookie session is set
4. Protected routes (`/profile`, `/chat/*`) require a valid session, enforced server-side in `_authed.tsx`

## AI Chat

- Three chat routes: `/chat` (conversation list), `/chat/new` (new conversation), `/chat/:conversationId` (existing conversation)
- Conversations are stored in Postgres (`Conversation` + `Message` tables)
- Messages are streamed from `/api/chat` using the Vercel AI SDK data stream protocol
- Rate limiting: 20 requests per minute per user (Redis-backed in production, Memory in tests)
- All chat pages follow the ViewModel pattern — logic lives in `*.view-model.ts` hooks, views pass props to pure components

## Deployment

Production deployment is designed for Coolify + Traefik on a VPS. Use `docker-compose.prod.yml`; Coolify manages environment variables, Traefik routing, and TLS from its UI. See [`docs/guides/deployment.md`](docs/guides/deployment.md).

## Documentation

Architectural guides live in `docs/guides/`:

- [`environment-setup.md`](docs/guides/environment-setup.md) — env vars, Docker services, how variables are consumed, production notes
- [`observability.md`](docs/guides/observability.md) — pino logging, Sentry error tracking, health endpoint
- [`analytics.md`](docs/guides/analytics.md) — GA4 setup and conditional script injection
- [`deployment.md`](docs/guides/deployment.md) — Coolify + Traefik deployment with `docker-compose.prod.yml`
- [`email-setup.md`](docs/guides/email-setup.md) — local Mailpit setup, production SMTP providers (Resend, Postmark, SendGrid, SES)
- [`auth-architecture.md`](docs/guides/auth-architecture.md) — better-auth wiring, `$.ts` wildcard routes, auth service layer
- [`tanstack-start-routing-auth.md`](docs/guides/tanstack-start-routing-auth.md) — file-based routing, auth guard, public vs private routes
- [`tanstack-start-server-primitives.md`](docs/guides/tanstack-start-server-primitives.md) — `createServerFn` vs `server.handlers` vs tRPC
- [`trpc-new-endpoints.md`](docs/guides/trpc-new-endpoints.md) — adding a new tRPC module end-to-end
