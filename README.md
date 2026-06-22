# TanStack Start Full-Stack Template

A production-ready full-stack template using TanStack Start, tRPC v11, better-auth, PostgreSQL, Prisma, Redis, and the Vercel AI SDK.

## AI Coding Workflow

The template includes a requirements-to-delivery harness for Codex and Claude Code:

- canonical, repository-scoped skills in `.agents/skills/` for Codex;
- the same skills exposed through `.claude/skills/` for Claude Code;
- project specifications in `docs/specs/`;
- task state in `docs/tasks/`;
- review gates and operating guidance in [`docs/ai-workflow/README.md`](docs/ai-workflow/README.md).

The skill bodies have one canonical source under `.agents/skills/`. The Claude
Code entries are symlinks to that source so both agents follow the same
workflow without duplicated prompts drifting apart.

### How shared skills work

Each entry under `.claude/skills/` is a symlink to the matching canonical skill
directory under `.agents/skills/`. In editors such as Cursor this may look like
a normal folder, but the arrow badge and resolved hover path indicate it is a
filesystem link, not a second independent copy.

When adding a new shared skill:

1. Create the real skill at `.agents/skills/<skill-name>/`.
2. Add the skill files there, usually `SKILL.md`, `agents/openai.yaml`, and any
   `assets/`.
3. Create `.claude/skills/<skill-name>` as a symlink to
   `../../.agents/skills/<skill-name>`.
4. Run `pnpm harness:validate`.
5. Restart Codex or Claude Code if the new skill is not detected immediately.

Do not maintain duplicate skill bodies in both trees. Edit the canonical
`.agents/skills/` copy and let `.claude/skills/` point to it.

### Invoke a skill

| Agent | Explicit invocation | Example |
|---|---|---|
| Codex | `$<skill-name>` | `$workflow-intake` |
| Claude Code | `/<skill-name>` | `/workflow-intake` |

Most workflow skills may also be selected automatically when your request
matches their description. Prefer explicit invocation when starting a new
workflow phase or when you need a particular procedure. The mutation-heavy
`commit` and `create-pr` skills are explicit-only:

| Purpose | Codex | Claude Code |
|---|---|---|
| Create approved atomic commits | `$commit` | `/commit` |
| Push and create a GitHub PR | `$create-pr` | `/create-pr` |

If newly added skills do not appear, restart the relevant agent session so it
rescans the repository.

### Start a new project

```bash
pnpm harness:new-project -- "Project Name"
pnpm harness:validate
```

Then:

1. Complete [`docs/specs/_overview.md`](docs/specs/_overview.md) with the
   project identity, known stakeholders, constraints, and links or paths to raw
   source material.
2. Start discovery with `$workflow-intake` in Codex or `/workflow-intake` in
   Claude Code. The agent will clarify material gaps before drafting
   [`docs/specs/discovery.md`](docs/specs/discovery.md).
3. Review discovery with `$review-gate` or `/review-gate`. A human records
   stakeholder approval before discovery becomes `LOCKED`.
4. Continue through capability planning and detailed specifications.
5. Generate tasks only from approved specifications.
6. Execute and verify one ready task at a time.
7. Run the delivery review before release or stakeholder acceptance.

No implementation should begin until the relevant review gates pass.

### Run the workflow

| Phase | Skill | Explanation | Primary output | Required gate | Relevant docs / skills |
|---|---|---|---|---|---|
| Bootstrap | Manual setup | Capture project identity, source material, and operating constraints before discovery starts. | [`docs/specs/_overview.md`](docs/specs/_overview.md) | Gate 0 | [`docs/ai-workflow/README.md`](docs/ai-workflow/README.md), [`docs/ai-workflow/artifact-guide.md`](docs/ai-workflow/artifact-guide.md) |
| Discovery | `workflow-intake` | Turn raw notes or requests into a reviewable problem statement, scope, assumptions, and open questions. | [`docs/specs/discovery.md`](docs/specs/discovery.md) | Gate 1 | [`.agents/skills/workflow-intake/SKILL.md`](.agents/skills/workflow-intake/SKILL.md), [`docs/ai-workflow/review-gates.md`](docs/ai-workflow/review-gates.md) |
| Capability planning | `feature-mapping` | Break approved discovery into capabilities, actors, dependencies, slices, and build waves. | [`docs/specs/feature-map.md`](docs/specs/feature-map.md) | Gate 2 | [`.agents/skills/feature-mapping/SKILL.md`](.agents/skills/feature-mapping/SKILL.md), [`docs/ai-workflow/review-gates.md`](docs/ai-workflow/review-gates.md) |
| Data planning | `data-modeling` | Define entities, fields, invariants, lifecycle rules, and storage implications for an epic. | `docs/specs/<epic>/data-model.md` | Gate 3 | [`.agents/skills/data-modeling/SKILL.md`](.agents/skills/data-modeling/SKILL.md), [`docs/ai-workflow/artifact-guide.md`](docs/ai-workflow/artifact-guide.md) |
| Behavioral planning | `epic-and-flow` | Specify end-to-end behavior, user/system flows, validation, permissions, and edge cases. | `_epic.md` and `flow-*.md` | Gate 3 | [`.agents/skills/epic-and-flow/SKILL.md`](.agents/skills/epic-and-flow/SKILL.md), [`docs/ai-workflow/artifact-guide.md`](docs/ai-workflow/artifact-guide.md) |
| Boundary contracts | `api-spec` | Lock the interfaces between components or systems so implementation has a stable contract. | `docs/specs/<epic>/api.md` | Gate 3 | [`.agents/skills/api-spec/SKILL.md`](.agents/skills/api-spec/SKILL.md), [`docs/ai-workflow/artifact-guide.md`](docs/ai-workflow/artifact-guide.md) |
| Task planning | `task-generation` | Convert approved specs into atomic, dependency-aware implementation tasks with clear verification. | `docs/tasks/TASK-*.md` and [`docs/tasks/_index.md`](docs/tasks/_index.md) | Gate 4 | [`.agents/skills/task-generation/SKILL.md`](.agents/skills/task-generation/SKILL.md), [`docs/tasks/_index.md`](docs/tasks/_index.md) |
| Implementation | `execute-task` | Build one approved task at a time and record the verification evidence that proves it is done. | Code and verification evidence | Gate 5 | [`.agents/skills/execute-task/SKILL.md`](.agents/skills/execute-task/SKILL.md), [`.agents/skills/review-gate/SKILL.md`](.agents/skills/review-gate/SKILL.md), [`docs/specs/_context-block.md`](docs/specs/_context-block.md) |
| Scope changes | `change-management` | Assess new requirements or defects against locked artifacts and update only impacted specs and tasks. | Change record and affected artifacts | Reopen affected gates | [`.agents/skills/change-management/SKILL.md`](.agents/skills/change-management/SKILL.md), [`.agents/skills/review-gate/SKILL.md`](.agents/skills/review-gate/SKILL.md) |
| Delivery | `delivery-review` | Prepare stakeholder acceptance and release readiness with traceability, risks, and operational checks. | Release and acceptance evidence | Gate 6 | [`.agents/skills/delivery-review/SKILL.md`](.agents/skills/delivery-review/SKILL.md), [`docs/client-comms/README.md`](docs/client-comms/README.md), [`docs/ai-workflow/review-gates.md`](docs/ai-workflow/review-gates.md) |

Use `review-gate` at every transition. During execution, keep
[`docs/specs/_context-block.md`](docs/specs/_context-block.md),
[`docs/specs/_decisions.md`](docs/specs/_decisions.md), and
[`docs/tasks/_index.md`](docs/tasks/_index.md) synchronized with the actual
project state.

Detailed references:

- [Complete workflow and lifecycle](docs/ai-workflow/README.md)
- [Review gate criteria](docs/ai-workflow/review-gates.md)
- [Artifact ownership, statuses, and traceability](docs/ai-workflow/artifact-guide.md)
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
