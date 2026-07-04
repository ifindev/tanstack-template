import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { isChatEnabled } from "@/lib/server/ai/config";
import { getChatModel } from "@/lib/server/ai/openai";
import { auth } from "@/lib/server/auth/better-auth";
import { logger } from "@/lib/server/logger";
import { chatRateLimiter } from "@/lib/server/rate-limit/chat";
import { Sentry } from "@/lib/server/sentry/server";
import { chatApiRequestSchema } from "@/modules/chat/chat.api.schema";
import { MESSAGE_ROLE } from "@/modules/chat/chat.constant";
import {
  addMessage,
  createConversation,
  getConversation,
  renameConversation,
} from "@/modules/chat/chat.service";
import {
  buildProvisionalConversationTitle,
  generateConversationTitle,
} from "@/modules/chat/chat.title";
import {
  type ChatUiMessage,
  CONVERSATION_CREATED_DATA_PART,
} from "@/modules/chat/chat.ui";

const chatLogger = logger.child({ module: "chat-api" });

function jsonError(message: string, status: number, code: string) {
  return Response.json({ code, message }, { status });
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter(
      (messagePart): messagePart is { type: "text"; text: string } =>
        messagePart.type === "text",
    )
    .map((messagePart) => messagePart.text)
    .join("");
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
      return jsonError("Unauthorized", 401, "UNAUTHORIZED");
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
      return jsonError("Too many requests", 429, "TOO_MANY_REQUESTS");
    }

    const rawBody = await request.json();
    const parsedBody = chatApiRequestSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return jsonError(
        "Invalid chat request payload.",
        400,
        "INVALID_CHAT_REQUEST",
      );
    }

    const { messages, conversationId } = parsedBody.data;
    const lastUserMessage = messages.at(-1);
    const userPrompt =
      lastUserMessage?.role === MESSAGE_ROLE.USER
        ? getMessageText(lastUserMessage as UIMessage).trim()
        : "";

    if (!userPrompt) {
      return jsonError(
        "A non-empty user message is required.",
        400,
        "EMPTY_USER_MESSAGE",
      );
    }

    chatLogger.info({
      userId: user.id,
      conversationId,
      messageCount: messages.length,
      event: "stream_start",
    });

    let resolvedConversationId: string;
    if (conversationId) {
      const conversation = await getConversation(user.id, conversationId);
      if (!conversation) {
        return jsonError(
          "Conversation not found.",
          404,
          "CONVERSATION_NOT_FOUND",
        );
      }
      resolvedConversationId = conversationId;
    } else {
      const provisionalTitle = buildProvisionalConversationTitle(userPrompt);
      const conversation = await createConversation(user.id, provisionalTitle);
      resolvedConversationId = conversation.id;
    }

    await addMessage(resolvedConversationId, MESSAGE_ROLE.USER, userPrompt);

    const coreMessages = await convertToModelMessages(messages as UIMessage[]);

    const result = streamText({
      model: getChatModel(),
      messages: coreMessages,
      onFinish: async ({ text }) => {
        if (text) {
          await addMessage(
            resolvedConversationId,
            MESSAGE_ROLE.ASSISTANT,
            text,
          );
        }

        if (!conversationId) {
          try {
            const generatedTitle = await generateConversationTitle(userPrompt);
            await renameConversation(
              user.id,
              resolvedConversationId,
              generatedTitle,
            );
          } catch (error) {
            chatLogger.warn(
              {
                error,
                conversationId: resolvedConversationId,
                userId: user.id,
              },
              "Conversation title generation failed",
            );
          }
        }
      },
    });

    result.consumeStream();

    const stream = createUIMessageStream<ChatUiMessage>({
      execute: ({ writer }) => {
        if (!conversationId) {
          writer.write({
            type: CONVERSATION_CREATED_DATA_PART,
            data: { conversationId: resolvedConversationId },
            transient: true,
          });
        }

        writer.merge(
          result.toUIMessageStream({
            originalMessages: messages as ChatUiMessage[],
            onError: () =>
              "Chat provider request failed. Check AI provider configuration.",
          }),
        );
      },
    });

    return createUIMessageStreamResponse({ stream });
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
