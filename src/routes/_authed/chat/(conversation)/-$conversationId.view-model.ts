import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useChatSession } from "@/hooks/use-chat-session";
import { trpc } from "@/lib/client/trpc";
import type { ChatUiMessage } from "@/modules/chat/chat.ui";

function mapMessagesToUiFormat(
  messages:
    | Array<{
        id: string;
        role: string;
        content: string;
      }>
    | undefined,
): ChatUiMessage[] {
  if (!messages) return [];
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant" | "system",
    content: msg.content,
    parts: [
      {
        type: "text",
        text: msg.content,
      },
    ],
  }));
}

export function useConversationViewModel() {
  const params = useParams({
    from: "/_authed/chat/(conversation)/$conversationId",
  });
  const conversationId = params.conversationId;
  const { data, isLoading } = trpc.chat.getConversation.useQuery({
    id: conversationId,
  });

  const initialMessages = useMemo(
    () => mapMessagesToUiFormat(data?.messages),
    [data?.messages],
  );
  const title = data?.title ?? null;

  const chatSession = useChatSession({
    chatId: conversationId,
    conversationId,
    initialMessages,
    isConversationLoading: isLoading,
  });

  const scroll = useChatScroll({
    messages: chatSession.messages,
    isResponding: chatSession.isResponding,
  });

  const handleSubmit = (event: React.FormEvent) => {
    if (chatSession.canSubmit) {
      scroll.snapToBottom();
    }

    chatSession.onSubmit(event);
  };

  return {
    chatSession,
    scroll,
    onSubmit: handleSubmit,
    title,
    isLoading,
  };
}
