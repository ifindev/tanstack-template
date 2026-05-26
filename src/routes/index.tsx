import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { BrandLockup } from "@/components/layout/brand";
import {
  PageContainer,
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

const agentTools = ["Claude Code", "Cursor", "Codex", "GitHub Copilot"];

function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <PageContainer className="relative flex h-16 items-center justify-between gap-4">
          <Link to="/" className="min-w-0">
            <BrandLockup compact />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
            <HeaderLink href="#problem">Problem</HeaderLink>
            <HeaderLink href="#included">Stack</HeaderLink>
            <HeaderLink href="#agents">Agents</HeaderLink>
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
                  Problem
                </MobileLink>
                <MobileLink href="#included" onOpenChange={setMobileOpen}>
                  Stack
                </MobileLink>
                <MobileLink href="#agents" onOpenChange={setMobileOpen}>
                  Agents
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
              <div className="relative">
                <svg
                  className="absolute -left-16 top-1/2 hidden -translate-y-1/2 md:block"
                  width="56"
                  height="140"
                  viewBox="0 0 56 140"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M48 4 C48 4 8 30 8 50 C8 70 48 70 48 90 C48 110 8 116 8 136"
                    stroke="#cc785c"
                    strokeOpacity="0.4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    pathLength="1"
                    strokeDasharray="1"
                    style={{
                      strokeDashoffset: "0",
                      animation: "draw-path 0.9s ease-out 0.2s both",
                    } as CSSProperties}
                  />
                </svg>
                <svg
                  className="absolute -right-16 top-1/2 hidden -translate-y-1/2 md:block"
                  width="56"
                  height="140"
                  viewBox="0 0 56 140"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 4 C8 4 48 30 48 50 C48 70 8 70 8 90 C8 110 48 116 48 136"
                    stroke="#cc785c"
                    strokeOpacity="0.4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    pathLength="1"
                    strokeDasharray="1"
                    style={{
                      strokeDashoffset: "0",
                      animation: "draw-path 0.9s ease-out 0.2s both",
                    } as CSSProperties}
                  />
                </svg>
                <h1 className="display-hero">
                  From idea to working app in 30 minutes.
                </h1>
              </div>
              <p className="body-lead mx-auto max-w-2xl">
                Auth, database, AI streaming, and rate limiting — pre-wired. <br/>
                Clone and spend day one on your actual idea.
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

          <TerminalBlock />
        </PageContainer>
      </section>

      {/* ── Stat Strip ──────────────────────────────────────── */}
      <div className="border-y border-border">
        <PageContainer>
          <div className="grid grid-cols-2 divide-x divide-border md:grid-cols-4">
            {[
              { stat: "6", label: "commands to a running app" },
              { stat: "~30 min", label: "from clone to first feature" },
              { stat: "8", label: "services pre-wired" },
              { stat: "9", label: "architectural guides" },
            ].map(({ stat, label }) => (
              <div key={label} className="flex flex-col gap-1 px-6 py-8">
                <span className="font-mono text-2xl font-bold text-primary">
                  {stat}
                </span>
                <span className="text-xs leading-5 text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </PageContainer>
      </div>

      {/* ── The Problem ─────────────────────────────────────── */}
      <section id="problem" className="section-space bg-surface-soft/55">
        <PageContainer className="space-y-10">
          <div className="space-y-3">
            <h2 className="display-title max-w-2xl">
              Every new project starts with two weeks of setup.
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Before you write a single feature, these decisions need to be
              made. This template has already made them.
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
            {(
              [
                {
                  name: "Auth & identity",
                  desc: "Email sign-up, verification, cookie sessions, and server-side protected routes — before a single feature ships.",
                },
                {
                  name: "Data layer",
                  desc: "Prisma schema, migrations, and a type-safe tRPC API before you write the first endpoint.",
                },
                {
                  name: "AI transport",
                  desc: "Vercel AI SDK v6 has a specific transport config. One wrong version and your streaming breaks.",
                },
                {
                  name: "Observability & infra",
                  desc: "Structured logging, error boundaries, rate limiting, Docker Compose, and a deployment story before you go live.",
                },
              ] as { name: string; desc: string }[]
            ).map(({ name, desc }, i) => {
              const isRight = i % 2 === 1;
              const isBottom = i >= 2;
              return (
                <div
                  key={name}
                  className={[
                    "py-7",
                    isRight
                      ? "sm:border-l sm:border-border sm:pl-8"
                      : "sm:pr-8",
                    isBottom ? "sm:border-t sm:border-border" : "",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {name}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* ── What's Included ─────────────────────────────────── */}
      <section id="included" className="section-space">
        <PageContainer className="space-y-10">
          <div className="space-y-3 text-center">
            <h2 className="display-title mx-auto max-w-2xl">
              A coherent stack, not a collection of examples.
            </h2>
            <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground">
              Six pre-wired technologies, all on the correct versions. Clone it
              and spend day one on features, not configuration.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Left: stack list */}
            <div className="divide-y divide-border">
              {[
                {
                  name: "TanStack Start + Vite",
                  desc: "File-based routing, server functions, and a Vite build — fast, lightweight, and no Next.js overhead.",
                },
                {
                  name: "better-auth",
                  desc: "Email auth, protected routes, and rate limits. Already wired.",
                },
                {
                  name: "Prisma + tRPC v11",
                  desc: "Type-safe from database query to React component.",
                },
                {
                  name: "Vercel AI SDK v6",
                  desc: "Streaming responses and saved threads, on the right API.",
                },
                {
                  name: "pino + Sentry",
                  desc: "Structured logging and error boundaries on server and client.",
                },
                {
                  name: "Docker Compose",
                  desc: "Postgres, Redis, and Mailpit in one command locally.",
                },
              ].map(({ name, desc }) => (
                <div key={name} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-mono text-sm font-semibold text-foreground">
                    {name}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Right: dark code card */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#141413]">
              <div className="flex items-center gap-3 border-b border-white/8 px-5 py-3">
                <span className="font-mono text-xs text-[#888]">router.ts</span>
              </div>
              <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-7">
                <code>
                  <span className="text-[#cf9f7a]">export const</span>
                  <span className="text-[#e8e4dd]"> postRouter = </span>
                  <span className="text-[#cf9f7a]">router</span>
                  <span className="text-[#e8e4dd]">{"({"}</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"  "}create: </span>
                  <span className="text-[#cf9f7a]">protectedProcedure</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"    "}.input(</span>
                  <span className="text-[#cf9f7a]">z</span>
                  <span className="text-[#e8e4dd]">.object({"({"}</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"      "}title: </span>
                  <span className="text-[#cf9f7a]">z</span>
                  <span className="text-[#e8e4dd]">.string(),</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"      "}body:{"  "}</span>
                  <span className="text-[#cf9f7a]">z</span>
                  <span className="text-[#e8e4dd]">.string(),</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"    "}{"})"}))</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"    "}.mutation(</span>
                  <span className="text-[#cf9f7a]">async</span>
                  <span className="text-[#e8e4dd]">{" ({ ctx, input }) => {"}</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"      "}return </span>
                  <span className="text-[#cf9f7a]">createPost</span>
                  <span className="text-[#e8e4dd]">{"({"}</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"        "}userId: ctx.user.id,</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"        "}...input,</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"      "}{"})"}</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"    "}{"}),"}</span>
                  {"\n"}
                  <span className="text-[#e8e4dd]">{"});"}</span>
                </code>
              </pre>
              <div className="border-t border-white/8 px-5 py-4">
                <p className="text-sm leading-6 text-[#e8e4dd]/60">
                  Add a feature in 3 files. Your AI agent does the same —
                  every time, without guesswork.
                </p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>


      {/* ── AI-Assisted Development ──────────────────────── */}
      <section id="agents" className="section-space bg-surface-soft/55">
        <PageContainer className="space-y-10">
          <div className="space-y-3">
            <p className="section-label">AI-ready</p>
            <h2 className="display-title max-w-2xl">
              The perfect starter for vibecoding with AI agents.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {[
              {
                num: "01",
                title:
                  "Your AI reads the architecture before touching a file.",
                body: "CLAUDE.md gives every agent session full context — commands, patterns, and gotchas included.",
              },
              {
                num: "02",
                title: "Every pattern is documented. Agents follow them.",
                body: "9 guides covering auth, routing, tRPC, deployment, and observability — written for both humans and agents.",
              },
              {
                num: "03",
                title: "Add a module once. Your agent adds the next ten.",
                body: "schema → service → router. Consistent enough that Cursor never guesses where things go.",
              },
            ].map(({ num, title, body }) => (
              <SurfacePanel key={num} tone="card" padding="lg" className="space-y-4">
                <span className="font-mono text-4xl font-bold leading-none text-primary/20">
                  {num}
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold leading-6 text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm leading-6 text-body">{body}</p>
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
          <div className="space-y-3">
            <p className="font-heading text-[0.95rem] font-semibold tracking-[-0.02em] text-on-navy">
              Northstar Start
            </p>
            <p className="max-w-xs text-sm leading-6 text-on-navy-soft">
              TanStack Start with auth, AI streaming, and a module pattern your
              agents can follow from day one.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <DarkFooterColumn
              title="Use it"
              items={[
                { label: "Try the demo", href: "/register" },
                { label: "Sign in", href: "/login" },
                { label: "GitHub ↗", href: "#" },
              ]}
            />
            <DarkFooterColumn
              title="Learn"
              items={[
                { label: "Auth guide", href: "#" },
                { label: "tRPC endpoints", href: "#" },
                { label: "Deployment", href: "#" },
                { label: "Observability", href: "#" },
              ]}
            />
            <DarkFooterColumn
              title="Explore"
              items={[
                { label: "Problem", href: "#problem" },
                { label: "Stack", href: "#included" },
                { label: "Agents", href: "#agents" },
              ]}
            />
          </div>
        </PageContainer>
      </footer>
    </main>
  );
}

const terminalLines: { text: string; highlight?: boolean }[] = [
  { text: "$ git clone github.com/ifindev/tanstack-template.git my-app" },
  { text: "$ cd my-app" },
  { text: "$ pnpm install" },
  { text: "$ cp .env.example .env" },
  { text: "$ docker compose up postgres redis mailpit -d" },
  { text: "$ pnpm db:migrate && pnpm dev" },
  { text: "→ Ready at http://localhost:3000", highlight: true },
];

function TerminalBlock() {
  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/8 bg-[#141413] shadow-xl">
      <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
      </div>
      <div className="px-6 py-5 font-mono text-sm leading-7">
        {terminalLines.map((line, i) => (
          <div
            key={i}
            className={line.highlight ? "text-primary" : "text-[#e8e4dd]"}
            style={{
              opacity: 0,
              animation: `terminal-line 0.3s ease-out ${0.15 + i * 0.18}s both`,
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
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
