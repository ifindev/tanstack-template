import { createFileRoute } from "@tanstack/react-router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Sentry } from "@/shared/sentry/server";
import { createContext } from "@/shared/trpc/context";
import { appRouter } from "@/shared/trpc/router";

const ignoredSentryCodes = new Set([
  "UNAUTHORIZED",
  "TOO_MANY_REQUESTS",
  "BAD_REQUEST",
]);

const handleTrpcRequest = (request: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: ({ req }) => createContext(req),
    onError: ({ error, path, ctx }) => {
      if (!ignoredSentryCodes.has(error.code)) {
        Sentry.captureException(error, {
          extra: { path, userId: ctx?.user?.id },
        });
      }
    },
  });

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleTrpcRequest(request),
      POST: ({ request }) => handleTrpcRequest(request),
    },
  },
});
