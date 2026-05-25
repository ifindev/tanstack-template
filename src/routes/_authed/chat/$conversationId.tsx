import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { AlertCircle, Bot, Loader2, Send, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

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
  const { data: conversation } = trpc.chat.getConversation.useQuery({
    id: conversationId,
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const initialMessages = conversation?.messages.map(
    (message: ConversationMessage) => ({
      id: message.id,
      role: message.role as "user" | "assistant" | "system",
      parts: [{ type: "text" as const, text: message.content }],
      createdAt: new Date(message.createdAt),
    }),
  );
  const chatEnabled = features?.chatEnabled ?? false;
  const [chatError, setChatError] = useState<string | null>(null);

  const { messages, sendMessage, status } = useChat({
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

  const isLoading = status === "streaming" || status === "submitted";
  const composerDisabled = isLoadingFeatures || !chatEnabled || isLoading;

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

  const getMessageText = (chatMessage: (typeof messages)[number]): string =>
    chatMessage.parts
      .filter(
        (messagePart): messagePart is { type: "text"; text: string } =>
          messagePart.type === "text",
      )
      .map((messagePart) => messagePart.text)
      .join("");

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="sticky top-14 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-semibold">
              {conversation?.title ?? "Loading conversation"}
            </p>
            <p className="text-xs text-muted-foreground">
              Messages are saved to this thread.
            </p>
          </div>
          {isLoading && (
            <div className="flex shrink-0 items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Responding
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6">
          {messages.length === 0 && !isLoading && (
            <div className="rounded-lg border border-dashed bg-card p-8 text-center text-card-foreground">
              <div className="mx-auto flex size-10 items-center justify-center rounded-md bg-muted">
                <Bot className="size-5 text-muted-foreground" />
              </div>
              <h2 className="mt-3 font-heading text-base font-medium">
                Start the conversation
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Send a message when the AI provider is configured.
              </p>
            </div>
          )}

          {messages.map((chatMessage) => {
            const isUser = chatMessage.role === "user";
            return (
              <div
                key={chatMessage.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Bot className="size-4" />
                  </span>
                )}
                <div
                  className={`max-w-[min(42rem,85%)] rounded-lg px-4 py-3 text-sm shadow-xs ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "border bg-card text-card-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                    {getMessageText(chatMessage)}
                  </p>
                </div>
                {isUser && (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <UserRound className="size-4" />
                  </span>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start gap-3">
              <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Bot className="size-4" />
              </span>
              <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-xs">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6"
      >
        <div className="mx-auto max-w-5xl space-y-3">
          {!isLoadingFeatures && !chatEnabled && (
            <div className="flex gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Chat provider is not configured.</p>
                <p className="mt-1 text-destructive/85">
                  Set AI_API_KEY and AI_MODEL to send messages.
                </p>
              </div>
            </div>
          )}
          {chatError && (
            <div className="flex gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{chatError}</p>
            </div>
          )}
          <div className="flex flex-col gap-2 rounded-lg border bg-card p-2 shadow-xs sm:flex-row sm:items-end">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                chatEnabled ? "Type a message..." : "Chat is disabled"
              }
              className="max-h-48 min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
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
        </div>
      </form>
    </main>
  );
}
