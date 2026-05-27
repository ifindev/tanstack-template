import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { MESSAGE_ROLE } from "@/modules/chat/constants";
import {
  addMessage,
  createConversation,
  getConversation,
  renameConversation,
} from "@/modules/chat/service";
import {
  buildProvisionalConversationTitle,
  generateConversationTitle,
} from "@/modules/chat/title";
import {
  type ChatUiMessage,
  CONVERSATION_CREATED_DATA_PART,
} from "@/modules/chat/ui";
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
    const lastUserMessage = messages.at(-1);
    const userPrompt =
      lastUserMessage?.role === MESSAGE_ROLE.USER
        ? getMessageText(lastUserMessage).trim()
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

    let resolvedConversationId = conversationId;
    if (resolvedConversationId) {
      const conversation = await getConversation(
        user.id,
        resolvedConversationId,
      );
      if (!conversation) {
        return jsonError(
          "Conversation not found.",
          404,
          "CONVERSATION_NOT_FOUND",
        );
      }
    } else {
      const provisionalTitle = buildProvisionalConversationTitle(userPrompt);
      const conversation = await createConversation(user.id, provisionalTitle);
      resolvedConversationId = conversation.id;
    }

    await addMessage(resolvedConversationId, MESSAGE_ROLE.USER, userPrompt);

    const coreMessages = await convertToModelMessages(messages);

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
