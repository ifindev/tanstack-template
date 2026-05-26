import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { AlertCircle, ArrowDown, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageContainer } from "@/components/layout/editorial";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  type ConversationUiMessage,
  ConversationPanel,
} from "./conversation-panel";

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
  const { data: features, isLoading: isLoadingFeatures } =
    trpc.config.features.useQuery();
  const {
    data: conversation,
    isFetching: isFetchingConversation,
    isLoading: isLoadingConversation,
  } = trpc.chat.getConversation.useQuery({ id: conversationId });
  const bottomRef = useRef<HTMLDivElement>(null);
  const hydratedConversationIdRef = useRef<string | null>(null);
  const [input, setInput] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);

  const initialMessages: ConversationUiMessage[] =
    conversation?.messages.map(
    (message: ConversationMessage) => ({
      id: message.id,
      role: message.role as "user" | "assistant" | "system",
      parts: [{ type: "text" as const, text: message.content }],
    }),
  ) ?? [];
  const chatEnabled = features?.chatEnabled ?? false;
  const [chatError, setChatError] = useState<string | null>(null);

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { conversationId },
    }),
    id: conversationId,
    messages: initialMessages,
    onError: () => {
      setChatError(
        "Chat provider request failed. Check AI provider configuration.",
      );
    },
  });

  const isResponding = status === "streaming" || status === "submitted";
  const isConversationLoading =
    (isLoadingConversation || isFetchingConversation) && !conversation;
  const composerDisabled =
    isLoadingFeatures || !chatEnabled || isResponding || isConversationLoading;

  useEffect(() => {
    hydratedConversationIdRef.current = null;
  }, [conversationId]);

  useEffect(() => {
    if (!conversation) return;
    if (hydratedConversationIdRef.current === conversationId) return;

    setMessages(initialMessages);
    hydratedConversationIdRef.current = conversationId;
  }, [conversation, conversationId, initialMessages, setMessages]);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsAtBottom(entry?.isIntersecting ?? true),
    );
    observer.observe(el);
    return () => observer.disconnect();
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
          <ConversationPanel
            bottomRef={bottomRef}
            isConversationLoading={isConversationLoading}
            isResponding={isResponding}
            messages={messages as ConversationUiMessage[]}
            title={conversation?.title}
          />
        </PageContainer>
      </div>

      <div className="relative shrink-0 border-t border-border/80 bg-background/92 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
          {!isLoadingFeatures && !chatEnabled && (
            <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Chat provider is not configured.</p>
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
            <div className="surface-card flex flex-col gap-3 p-3 sm:flex-row sm:items-end">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  chatEnabled ? "Write the next message..." : "Chat is disabled"
                }
                className="max-h-48 min-h-24 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
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
              <Button
                type="submit"
                disabled={composerDisabled || !input.trim()}
                className="w-full sm:w-auto"
              >
                <Send className="size-4" />
                Send
              </Button>
            </div>
          </form>
        </PageContainer>
      </div>
    </main>
  );
}
