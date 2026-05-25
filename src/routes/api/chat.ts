import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";
import { MESSAGE_ROLE } from "@/modules/chat/constants";
import { addMessage } from "@/modules/chat/service";
import { isChatEnabled } from "@/shared/ai/config";
import { getChatModel } from "@/shared/ai/openai";
import { auth } from "@/shared/auth/better-auth";
import { logger } from "@/shared/logger";
import { chatRateLimiter } from "@/shared/rate-limit/chat";
import { Sentry } from "@/shared/sentry/server";

const chatLogger = logger.child({ module: "chat-api" });

function jsonError(message: string, status: number, code: string) {
  return Response.json({ code, message }, { status });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => handleChatPost(request),
    },
  },
});

export async function handleChatPost(request: Request) {
  try {
    const sessionData = await auth.api.getSession({
      headers: request.headers,
    });
    if (!sessionData?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const user = sessionData.user;

    if (!isChatEnabled()) {
      return jsonError(
        "Chat is disabled because AI provider config is missing.",
        503,
        "CHAT_DISABLED",
      );
    }

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

    // Persist the last user message before streaming.
    const lastUserMessage = messages.at(-1);
    if (lastUserMessage?.role === MESSAGE_ROLE.USER && conversationId) {
      const text = lastUserMessage.parts
        .filter(
          (messagePart): messagePart is { type: "text"; text: string } =>
            messagePart.type === "text",
        )
        .map((messagePart) => messagePart.text)
        .join("");
      if (text) await addMessage(conversationId, MESSAGE_ROLE.USER, text);
    }

    const coreMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: getChatModel(),
      messages: coreMessages,
      onFinish: async ({ text }) => {
        if (conversationId) {
          await addMessage(conversationId, MESSAGE_ROLE.ASSISTANT, text);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      onError: () =>
        "Chat provider request failed. Check AI provider configuration.",
    });
  } catch (error) {
    chatLogger.error({ error }, "Chat stream failed");
    Sentry.captureException(error);
    return jsonError(
      "Chat provider request failed. Check AI provider configuration.",
      503,
      "CHAT_PROVIDER_ERROR",
    );
  }
}
