import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  Lock,
  MessageSquare,
  Server,
} from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading font-semibold"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </span>
            TanStack Template
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_25rem] lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm text-muted-foreground shadow-xs">
            <CheckCircle2 className="size-4 text-primary" />
            Production-ready full-stack starter
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            TanStack Start Template
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Auth, AI chat, tRPC, Prisma, observability, and Docker-based local
            infrastructure in one coherent application foundation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/register">
                Create account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-heading text-sm font-medium">App preview</p>
              <p className="text-xs text-muted-foreground">
                Authenticated shell
              </p>
            </div>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
              Live
            </span>
          </div>
          <div className="space-y-3">
            <PreviewRow icon={Lock} label="Verified email auth" value="Ready" />
            <PreviewRow
              icon={MessageSquare}
              label="AI chat module"
              value="On"
            />
            <PreviewRow icon={Database} label="Prisma PostgreSQL" value="16" />
            <PreviewRow icon={Server} label="Docker services" value="Local" />
          </div>
          <div className="mt-4 rounded-lg bg-muted p-3">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-background text-primary">
                <Bot className="size-4" />
              </span>
              <span className="text-sm font-medium">Chat workspace</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="w-5/6 rounded-md bg-background px-3 py-2 shadow-xs">
                What can this template ship?
              </div>
              <div className="ml-auto w-4/5 rounded-md bg-primary px-3 py-2 text-primary-foreground shadow-xs">
                A complete authenticated AI app baseline.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-primary" />
        <span className="truncate text-sm">{label}</span>
      </div>
      <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
        {value}
      </span>
    </div>
  );
}
