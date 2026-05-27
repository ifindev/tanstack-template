import { useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { useChatSession } from "@/hooks/use-chat-session";

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

  return {
    chatSession,
  };
}
