import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          TanStack Start Template
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Full-stack template with auth, AI chat, and Docker-based local dev.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/register"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Get started
          </a>
          <a
            href="/login"
            className="rounded-md bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90"
          >
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}
