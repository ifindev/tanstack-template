import { useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { useChatSession } from "@/hooks/use-chat-session";
import { useChatScroll } from "@/hooks/use-chat-scroll";

export function useNewConversationViewModel() {
  const navigate = useNavigate();
  const createdIdRef = useRef<string | null>(null);

  const handleConversationCreated = (id: string) => {
    createdIdRef.current = id;
  };

  const handleChatFinished = () => {
    if (createdIdRef.current) {
      navigate({
        to: "/chat/$conversationId",
        params: { conversationId: createdIdRef.current },
      });
    }
  };

  const chatSession = useChatSession({
    chatId: "draft-chat",
    isConversationLoading: false,
    onConversationCreated: handleConversationCreated,
    onChatFinished: handleChatFinished,
  });

  const scroll = useChatScroll({
    messages: chatSession.messages,
    isResponding: chatSession.isResponding,
  });

  return {
    chatSession,
    scroll,
  };
}
