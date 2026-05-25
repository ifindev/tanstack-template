import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
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
    <>
      <Navbar />
      <main className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="border-b px-4 py-3">
          <h1 className="font-semibold">
            {conversation?.title ?? "Loading..."}
          </h1>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((chatMessage) => (
              <div
                key={chatMessage.id}
                className={`flex ${chatMessage.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    chatMessage.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getMessageText(chatMessage)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t p-4">
          {!isLoadingFeatures && !chatEnabled && (
            <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Chat is disabled because AI provider config is missing. Set
              AI_API_KEY and AI_MODEL to send messages.
            </div>
          )}
          {chatError && (
            <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {chatError}
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                chatEnabled ? "Type a message..." : "Chat is disabled"
              }
              className="min-h-[60px] resize-none"
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
            <Button type="submit" disabled={composerDisabled || !input.trim()}>
              Send
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
