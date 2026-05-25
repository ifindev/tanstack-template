import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";
import { MESSAGE_ROLE } from "@/modules/chat/constants";
import { addMessage } from "@/modules/chat/service";
import { openai } from "@/shared/ai/openai";
import { auth } from "@/shared/auth/better-auth";
import { logger } from "@/shared/logger";
import { chatRateLimiter } from "@/shared/rate-limit/chat";
import { Sentry } from "@/shared/sentry/server";

const chatLogger = logger.child({ module: "chat-api" });

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const sessionData = await auth.api.getSession({
            headers: request.headers,
          });
          if (!sessionData?.user) {
            return new Response("Unauthorized", { status: 401 });
          }
          const user = sessionData.user;

          try {
            await chatRateLimiter.consume(user.id);
          } catch {
            return new Response("Too many requests", { status: 429 });
          }

          const body = (await request.json()) as {
            id?: string;
            messages: UIMessage[];
            conversationId?: string;
          };

          const { messages, conversationId } = body;
          chatLogger.info({
            userId: user.id,
            conversationId,
            messageCount: messages.length,
            event: "stream_start",
          });

          // Persist the last user message before streaming
          const lastUserMessage = messages.at(-1);
          if (lastUserMessage?.role === MESSAGE_ROLE.USER && conversationId) {
            const text = lastUserMessage.parts
              .filter(
                (p): p is { type: "text"; text: string } => p.type === "text",
              )
              .map((p) => p.text)
              .join("");
            if (text) await addMessage(conversationId, MESSAGE_ROLE.USER, text);
          }

          const coreMessages = await convertToModelMessages(messages);

          const result = streamText({
            model: openai("gpt-4o-mini"),
            messages: coreMessages,
            onFinish: async ({ text }) => {
              if (conversationId) {
                await addMessage(conversationId, MESSAGE_ROLE.ASSISTANT, text);
              }
            },
          });

          return result.toUIMessageStreamResponse();
        } catch (error) {
          chatLogger.error({ error }, "Chat stream failed");
          Sentry.captureException(error);
          return new Response("Internal server error", { status: 500 });
        }
      },
    },
  },
});
