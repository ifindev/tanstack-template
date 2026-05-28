import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import {
  type ChatUiMessage,
  CONVERSATION_CREATED_DATA_PART,
} from "@/modules/chat/ui";
import { trpc } from "@/lib/trpc";

type UseChatSessionProps = {
  chatId: string;
  conversationId?: string;
  initialMessages?: ChatUiMessage[];
  isConversationLoading: boolean;
  onConversationCreated?: (conversationId: string) => void;
  onChatFinished?: () => void;
};

const CHAT_PROVIDER_ERROR =
  "Chat provider request failed. Check AI provider configuration.";

export function useChatSession({
  chatId,
  conversationId,
  initialMessages = [],
  isConversationLoading,
  onConversationCreated,
  onChatFinished,
}: UseChatSessionProps) {
  const { data: features, isLoading: isLoadingFeatures } =
    trpc.config.features.useQuery();

  const [input, setInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEnabled = features?.chatEnabled ?? false;

  const { messages, sendMessage, status } = useChat<ChatUiMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: conversationId ? { conversationId } : undefined,
    }),
    id: chatId,
    messages: initialMessages,
    onData: (dataPart) => {
      if (dataPart.type !== CONVERSATION_CREATED_DATA_PART) return;
      onConversationCreated?.(dataPart.data.conversationId);
    },
    onError: () => {
      setChatError(CHAT_PROVIDER_ERROR);
    },
    onFinish: () => {
      onChatFinished?.();
    },
  });

  const isResponding = status === "streaming" || status === "submitted";
  const composerDisabled =
    isLoadingFeatures || !chatEnabled || isResponding || isConversationLoading;

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || composerDisabled) return;

    setChatError(null);
    sendMessage({ text: input });
    setInput("");
  };

  return {
    messages,
    input,
    chatError,
    isResponding,
    composerDisabled,
    chatEnabled,
    isLoadingFeatures,
    onInputChange: handleInputChange,
    onSubmit: handleSubmit,
  };
}
