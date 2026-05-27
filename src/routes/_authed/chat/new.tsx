import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import ChatSession from "@/components/chat/chat-session";
import { DEFAULT_CONVERSATION_TITLE } from "@/modules/chat/constants";

const DRAFT_CHAT_ID = "draft-chat";

export const Route = createFileRoute("/_authed/chat/new")({
  component: NewConversationPage,
});

function NewConversationPage() {
  const navigate = useNavigate();
  const createdConversationIdRef = useRef<string | null>(null);

  return (
    <ChatSession
      chatId={DRAFT_CHAT_ID}
      isConversationLoading={false}
      title={DEFAULT_CONVERSATION_TITLE}
      onConversationCreated={(conversationId) => {
        createdConversationIdRef.current = conversationId;
      }}
      onChatFinished={() => {
        const conversationId = createdConversationIdRef.current;
        if (!conversationId) return;

        navigate({
          to: "/chat/$conversationId",
          params: { conversationId },
        });
      }}
    />
  );
}
