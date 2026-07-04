import { createFileRoute } from "@tanstack/react-router";
import { handleAuthRequest } from "@/lib/server/auth/auth-handler";
import "@/lib/server/sentry/server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthRequest(request),
      POST: ({ request }) => handleAuthRequest(request),
    },
  },
});
