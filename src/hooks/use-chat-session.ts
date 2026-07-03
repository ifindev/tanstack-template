import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/client/trpc";
import {
  type ChatUiMessage,
  CONVERSATION_CREATED_DATA_PART,
} from "@/modules/chat/chat.ui";

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

  const { messages, sendMessage, status, setMessages } = useChat<ChatUiMessage>(
    {
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
    },
  );

  // useChat reads `messages` prop only at mount. For existing conversations the
  // tRPC query resolves after mount, so we hydrate the store once when the first
  // non-empty initialMessages arrives. The ref prevents re-hydration on refetches
  // or during/after streaming.
  const hasHydratedRef = useRef(initialMessages.length > 0);
  useEffect(() => {
    if (!hasHydratedRef.current && initialMessages.length > 0) {
      setMessages(initialMessages);
      hasHydratedRef.current = true;
    }
  }, [initialMessages, setMessages]);

  const isResponding = status === "streaming" || status === "submitted";
  const composerDisabled =
    isLoadingFeatures || !chatEnabled || isResponding || isConversationLoading;
  const canSubmit = input.trim().length > 0 && !composerDisabled;

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

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
    canSubmit,
    chatEnabled,
    isLoadingFeatures,
    onInputChange: handleInputChange,
    onSubmit: handleSubmit,
  };
}
