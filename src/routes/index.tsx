import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Database,
  Layers,
  Lock,
  Menu,
  Server,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { BrandLockup } from "@/components/layout/brand";
import {
  PageContainer,
  SectionIntro,
  SurfacePanel,
} from "@/components/layout/editorial";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const stackBadges = [
  "TanStack Start",
  "tRPC v11",
  "better-auth",
  "Prisma",
  "PostgreSQL",
  "Redis",
  "Vercel AI SDK",
  "pino + Sentry",
];

const problemCards: { icon: LucideIcon; title: string; description: string }[] =
  [
    {
      icon: Lock,
      title: "Auth & sessions",
      description:
        "Email/password sign-up, email verification, cookie sessions via better-auth, protected routing, and rate-limited auth endpoints.",
    },
    {
      icon: Database,
      title: "Data & API",
      description:
        "Prisma schema, migrations, tRPC v11 with Zod validation, and a schema → service → router module pattern enforced across the codebase.",
    },
    {
      icon: Bot,
      title: "AI integration",
      description:
        "Vercel AI SDK v6 with DefaultChatTransport, streaming responses, and conversation threads saved to Postgres.",
    },
    {
      icon: Server,
      title: "Observability & infra",
      description:
        "pino structured logging, Sentry error boundaries, Redis rate limiting, Docker Compose, and a Coolify + Traefik deployment guide.",
    },
  ];

const featureCards: { icon: LucideIcon; title: string; description: string }[] =
  [
    {
      icon: Lock,
      title: "Authentication",
      description:
        "Email/password sign-up and sign-in, email verification flow, cookie sessions via better-auth, server-side protected routing, and rate-limited auth endpoints.",
    },
    {
      icon: Database,
      title: "Data layer",
      description:
        "Prisma ORM with PostgreSQL, Zod input schemas, tRPC v11 procedures with publicProcedure / protectedProcedure / authRateLimitedProcedure. Schema → service → router module pattern enforced across the codebase.",
    },
    {
      icon: Sparkles,
      title: "AI & infra",
      description:
        "Vercel AI SDK v6 with DefaultChatTransport, streaming responses, threads saved to Postgres. Redis rate limiting. pino logging. Sentry on server and client. Docker Compose for local services.",
    },
  ];

const agentCards: { icon: LucideIcon; title: string; description: string }[] =
  [
    {
      icon: Bot,
      title: "CLAUDE.md included",
      description:
        "Project-aware context Claude Code reads every session. Agents understand the architecture, commands, and gotchas before touching a file.",
    },
    {
      icon: BookOpen,
      title: "9 architectural guides",
      description:
        "Auth, routing, tRPC, deployment, observability — documented comprehensively for both humans and AI agents to follow and extend.",
    },
    {
      icon: Layers,
      title: "Predictable module patterns",
      description:
        "Every feature follows schema → service → router. Once an agent learns one module, it can add the next one without guesswork.",
    },
  ];

const agentTools = ["Claude Code", "Cursor", "Codex", "GitHub Copilot"];

const quickStartCommands = `git clone <repo> my-app && cd my-app
pnpm install
cp .env.example .env   # fill BETTER_AUTH_SECRET + AI_API_KEY
docker compose up postgres redis mailpit -d
pnpm db:migrate && pnpm dev
# → http://localhost:3000`;

function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <PageContainer className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="min-w-0">
            <BrandLockup compact />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <HeaderLink href="#problem">The problem</HeaderLink>
            <HeaderLink href="#included">What's included</HeaderLink>
            <HeaderLink href="#quickstart">Quick start</HeaderLink>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">
                Try the demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-sm" className="md:hidden">
                {mobileOpen ? (
                  <X className="size-4" />
                ) : (
                  <Menu className="size-4" />
                )}
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <SheetHeader>
                <SheetTitle>Northstar Start</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-5 pb-5">
                <MobileLink href="#problem" onOpenChange={setMobileOpen}>
                  The problem
                </MobileLink>
                <MobileLink href="#included" onOpenChange={setMobileOpen}>
                  What's included
                </MobileLink>
                <MobileLink href="#quickstart" onOpenChange={setMobileOpen}>
                  Quick start
                </MobileLink>
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Try the demo</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </PageContainer>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="section-space">
        <PageContainer className="space-y-10">
          <div className="mx-auto flex max-w-4xl flex-col items-center space-y-7 text-center">
            <div className="space-y-4">
              <h1 className="display-hero">
                From idea to working app in 30 minutes.
              </h1>
              <p className="body-lead mx-auto max-w-2xl">
                Northstar Start skips the setup sprint. Auth, database, AI
                chat, rate limiting, and observability are pre-wired into a
                clean TanStack Start template. Clone it — then write features.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link to="/register">
                  Try the live demo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            <SurfacePanel tone="card" padding="lg" className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                What's pre-wired
              </p>
              <div className="flex flex-wrap gap-2">
                {stackBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                All wired together. No integration work required.
              </p>
            </SurfacePanel>

            <SurfacePanel tone="card" padding="lg" className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Bot className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Conversation shell
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Saved threads and streaming responses
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-white">
                  What does this starter remove from the first sprint?
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-surface-soft px-4 py-3 text-body">
                  Repeated setup: auth, chat transport, data contracts,
                  stateful product surfaces.
                </div>
              </div>
            </SurfacePanel>
          </div>
        </PageContainer>
      </section>

      {/* ── The Problem ─────────────────────────────────────── */}
      <section id="problem" className="section-space bg-surface-soft/55">
        <PageContainer className="space-y-10">
          <SectionIntro
            eyebrow="The problem"
            title="Every new project starts with two weeks of setup."
            description="Before you can write a single feature you need auth, email verification, database migrations, an API layer, rate limiting, error tracking, and a deployment story. This template has already made those decisions."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            {problemCards.map((card) => (
              <SurfacePanel key={card.title} tone="card" padding="lg">
                <div className="flex gap-4">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
                    <card.icon className="size-4" />
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-7 text-body">
                      {card.description}
                    </p>
                  </div>
                </div>
              </SurfacePanel>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── What's Included ─────────────────────────────────── */}
      <section id="included" className="section-space">
        <PageContainer className="space-y-10">
          <SectionIntro
            eyebrow="What's included"
            title="A coherent stack, not a collection of examples."
            description="The pieces are opinionated enough to create momentum, but still modular enough to change without rewriting the whole app."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {featureCards.map((card) => (
              <SurfacePanel key={card.title} tone="card" padding="lg">
                <div className="space-y-5">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-background text-primary">
                    <card.icon className="size-5" />
                  </span>
                  <div className="space-y-3">
                    <h3 className="display-subtitle text-[1.55rem]">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-7 text-body">
                      {card.description}
                    </p>
                  </div>
                </div>
              </SurfacePanel>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── Quick Start ─────────────────────────────────────── */}
      <section id="quickstart" className="section-space">
        <PageContainer className="space-y-10">
          <SectionIntro
            eyebrow="Get started"
            title="Running in under 5 minutes."
            description="Five commands and you have a working app with auth, database, email, and AI chat — without breaking a sweat."
          />

          <SurfacePanel tone="card" padding="lg" className="space-y-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Quick start
            </p>
            <pre className="mono-scroll overflow-x-auto rounded-lg border border-border bg-surface-soft p-4 text-body">
              {quickStartCommands}
            </pre>
            <p className="text-sm text-muted-foreground">
              Mailpit (email preview) at{" "}
              <span className="font-mono text-xs">http://localhost:8025</span>
            </p>
          </SurfacePanel>
        </PageContainer>
      </section>

      {/* ── AI-Assisted Development ──────────────────────── */}
      <section className="section-space bg-surface-soft/55">
        <PageContainer className="space-y-10">
          <SectionIntro
            eyebrow="Built for AI-assisted development"
            title="The perfect starter for vibecoding with AI agents."
            description="Comprehensive documentation, a structured CLAUDE.md, and consistent module patterns mean Cursor, Claude Code, and Codex can navigate and extend this codebase from day one."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {agentCards.map((card) => (
              <SurfacePanel key={card.title} tone="card" padding="lg">
                <div className="space-y-5">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-background text-primary">
                    <card.icon className="size-5" />
                  </span>
                  <div className="space-y-3">
                    <h3 className="display-subtitle text-[1.55rem]">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-7 text-body">
                      {card.description}
                    </p>
                  </div>
                </div>
              </SurfacePanel>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              Works great with
            </span>
            {agentTools.map((tool) => (
              <span
                key={tool}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
              >
                {tool}
              </span>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-8 sm:py-12">
        <PageContainer>
          <SurfacePanel tone="coral" padding="xl" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  Ready to vibe code
                </p>
                <h2 className="display-title max-w-3xl text-white">
                  Clone it. Open Cursor or Claude Code. Ship.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-white/84 sm:text-lg">
                  The setup sprint is already done, the docs are written, and
                  the patterns are set. Start on the actual product.
                </p>
              </div>

              <Button
                size="lg"
                variant="secondary"
                className="border-white/20 bg-canvas text-foreground hover:bg-canvas/90"
                asChild
              >
                <Link to="/register">
                  Try the live demo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </SurfacePanel>
        </PageContainer>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-surface-navy py-16">
        <PageContainer className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)]">
          <div className="space-y-4">
            <BrandLockup
              title="Northstar Start"
              subtitle="Warm editorial shell, practical product foundation"
              className="[&_span:last-child>span:first-child]:text-on-navy [&_span:last-child>span:last-child]:text-on-navy-soft"
            />
            <p className="max-w-md text-sm leading-7 text-on-navy-soft">
              Built for developers who want their starter to survive contact
              with auth, data models, AI transport, and real user flows.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <DarkFooterColumn
              title="Stack"
              items={[
                { label: "TanStack Start" },
                { label: "tRPC v11" },
                { label: "better-auth" },
                { label: "Prisma" },
              ]}
            />
            <DarkFooterColumn
              title="Included"
              items={[
                { label: "AI chat" },
                { label: "Redis" },
                { label: "pino + Sentry" },
                { label: "Docker Compose" },
              ]}
            />
            <DarkFooterColumn
              title="Explore"
              items={[
                { label: "Try the demo", href: "/register" },
                { label: "Sign in", href: "/login" },
              ]}
            />
          </div>
        </PageContainer>
      </footer>
    </main>
  );
}

function HeaderLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      {children}
    </a>
  );
}

function MobileLink({
  href,
  children,
  onOpenChange,
}: {
  href: string;
  children: string;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <a
      href={href}
      className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground"
      onClick={() => onOpenChange(false)}
    >
      {children}
    </a>
  );
}

function DarkFooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href?: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-navy">
        {title}
      </p>
      <ul className="mt-4 space-y-3 text-sm">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <a
                href={item.href}
                className="text-on-navy-soft transition-colors hover:text-on-navy"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-on-navy-soft">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
