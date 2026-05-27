import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AlertCircle, ArrowDown, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ConversationPanel from "@/components/chat/conversation-panel";
import { PageContainer } from "@/components/layout/editorial";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  type ChatUiMessage,
  CONVERSATION_CREATED_DATA_PART,
} from "@/modules/chat/ui";

const CHAT_PROVIDER_ERROR =
  "Chat provider request failed. Check AI provider configuration.";

type ChatSessionProps = {
  chatId: string;
  conversationId?: string;
  initialMessages?: ChatUiMessage[];
  isConversationLoading: boolean;
  title?: string | null;
  onConversationCreated?: (conversationId: string) => void;
  onChatFinished?: () => void;
};

export default function ChatSession({
  chatId,
  conversationId,
  initialMessages = [],
  isConversationLoading,
  title,
  onConversationCreated,
  onChatFinished,
}: ChatSessionProps) {
  const { data: features, isLoading: isLoadingFeatures } =
    trpc.config.features.useQuery();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEnabled = features?.chatEnabled ?? false;

  const { messages, sendMessage, status } = useChat<ChatUiMessage>(
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

  const isResponding = status === "streaming" || status === "submitted";
  const composerDisabled =
    isLoadingFeatures || !chatEnabled || isResponding || isConversationLoading;

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;

    const viewport = el.closest<HTMLElement>(
      "[data-radix-scroll-area-viewport]",
    );
    if (!viewport) return;

    const checkAtBottom = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 10);
    };

    checkAtBottom();
    viewport.addEventListener("scroll", checkAtBottom, { passive: true });
    const ro = new ResizeObserver(checkAtBottom);
    ro.observe(viewport);

    return () => {
      viewport.removeEventListener("scroll", checkAtBottom);
      ro.disconnect();
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || composerDisabled) return;

    setChatError(null);
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <PageContainer className="flex h-full min-h-0 flex-col py-6 sm:py-8">
          <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col">
            <ConversationPanel
              bottomRef={bottomRef}
              isConversationLoading={isConversationLoading}
              isResponding={isResponding}
              messages={messages}
              title={title}
            />
          </div>
        </PageContainer>
      </div>

      <div className="relative shrink-0 bg-background/92 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
        {!isAtBottom && (
          <div className="absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full shadow-md"
              onClick={() =>
                bottomRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <ArrowDown className="size-4" />
            </Button>
          </div>
        )}
        <PageContainer className="space-y-3">
          <div className="mx-auto w-full max-w-2xl space-y-3">
            {!isLoadingFeatures && !chatEnabled && (
              <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">
                    Chat provider is not configured.
                  </p>
                  <p className="mt-1 text-destructive/85">
                    Set `AI_API_KEY` and `AI_MODEL` to send messages.
                  </p>
                </div>
              </div>
            )}
            {chatError && (
              <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{chatError}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="surface-card flex flex-col gap-2 p-2">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={
                    chatEnabled
                      ? "Write the next message..."
                      : "Chat is disabled"
                  }
                  className="max-h-48 min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
                  disabled={composerDisabled}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit(
                        event as unknown as React.FormEvent<HTMLFormElement>,
                      );
                    }
                  }}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={composerDisabled || !input.trim()}
                  >
                    <Send className="size-4" />
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </PageContainer>
      </div>
    </main>
  );
}
