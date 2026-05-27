import { createFileRoute } from "@tanstack/react-router";
import ChatSession from "@/components/chat/chat-session";
import { trpc } from "@/lib/trpc";
import { DEFAULT_CONVERSATION_TITLE } from "@/modules/chat/constants";
import type { ChatUiMessage } from "@/modules/chat/ui";

type ConversationMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

export const Route = createFileRoute("/_authed/chat/$conversationId")({
  component: ConversationPage,
});

function ConversationPage() {
  const { conversationId } = Route.useParams();
  const {
    data: conversation,
    isFetching: isFetchingConversation,
    isLoading: isLoadingConversation,
  } = trpc.chat.getConversation.useQuery({ id: conversationId });

  const initialMessages: ChatUiMessage[] =
    conversation?.messages.map((message: ConversationMessage) => ({
      id: message.id,
      role: message.role as "user" | "assistant" | "system",
      parts: [{ type: "text" as const, text: message.content }],
    })) ?? [];
  const isConversationLoading =
    (isLoadingConversation || isFetchingConversation) && !conversation;

  return (
    <ChatSession
      key={isConversationLoading ? `pending-${conversationId}` : conversationId}
      chatId={conversationId}
      conversationId={conversationId}
      initialMessages={initialMessages}
      isConversationLoading={isConversationLoading}
      title={conversation?.title ?? DEFAULT_CONVERSATION_TITLE}
    />
  );
}
