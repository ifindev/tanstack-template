import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/shared/auth/better-auth";
import "@/shared/sentry/server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
