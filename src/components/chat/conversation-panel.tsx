import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, Loader2, UserRound } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import MessageMarkdown from "@/components/chat/message-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatUiMessage } from "@/modules/chat/ui";

export type ConversationUiMessage = ChatUiMessage;

type ConversationPanelProps = {
  contentRef?: RefObject<HTMLDivElement | null>;
  viewportRef?: RefObject<HTMLDivElement | null>;
  isConversationLoading: boolean;
  isResponding: boolean;
  messages: ConversationUiMessage[];
  title?: string | null;
};

const skeletonRows = [
  {
    id: "user-question",
    role: "user" as const,
    widths: ["w-32"],
  },
  {
    id: "assistant-intro",
    role: "assistant" as const,
    widths: ["w-40", "w-56"],
  },
  {
    id: "user-question",
    role: "user" as const,
    widths: ["w-32"],
  },
  {
    id: "assistant-detail",
    role: "assistant" as const,
    widths: ["w-52", "w-72", "w-44"],
  },
  {
    id: "user-follow-up",
    role: "user" as const,
    widths: ["w-36", "w-24"],
  },
  {
    id: "assistant-close",
    role: "assistant" as const,
    widths: ["w-48", "w-64"],
  },
];

export function getMessageText(chatMessage: ConversationUiMessage): string {
  return chatMessage.parts
    .filter(
      (messagePart): messagePart is { type: "text"; text: string } =>
        messagePart.type === "text" && typeof messagePart.text === "string",
    )
    .map((messagePart) => messagePart.text)
    .join("");
}

export default function ConversationPanel({
  contentRef,
  viewportRef,
  isConversationLoading,
  isResponding,
  messages,
  title,
}: ConversationPanelProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-[2rem] bg-background">
      <div className="flex shrink-0 items-center gap-2 px-4 pb-4 sm:px-5">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link to="/chat">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <p className="truncate font-heading text-lg font-semibold tracking-[-0.03em] text-foreground sm:text-xl flex-1">
          {title ?? "Loading conversation"}
        </p>
        {isResponding && (
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface-soft px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Responding
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full" viewportRef={viewportRef}>
          <div
            ref={contentRef}
            className="space-y-4 px-4 py-5 pb-8 sm:px-5 sm:pb-10"
          >
            {isConversationLoading ? (
              <ConversationSkeletonList />
            ) : messages.length === 0 ? (
              <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-12 text-center">
                <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  Start chatting about anything.
                </h2>
              </div>
            ) : (
              messages.map((chatMessage) => {
                const messageText = getMessageText(chatMessage);
                const isUser = chatMessage.role === "user";

                return (
                  <MessageBubble key={chatMessage.id} isUser={isUser}>
                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words leading-7">
                        {messageText}
                      </p>
                    ) : (
                      <MessageMarkdown content={messageText} />
                    )}
                  </MessageBubble>
                );
              })
            )}

            {isResponding && <ThinkingBubble />}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}

function ConversationSkeletonList() {
  return (
    <div
      aria-label="Loading conversation history"
      className="space-y-4"
      role="status"
    >
      {skeletonRows.map((row) => {
        const isUser = row.role === "user";
        return (
          <div
            key={row.id}
            className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
          >
            {!isUser && (
              <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-soft text-primary/60">
                <Bot className="size-4" />
              </span>
            )}

            <div
              className={`max-w-[min(42rem,88%)] rounded-3xl px-4 py-3 ${
                isUser
                  ? "rounded-tr-sm bg-primary/14"
                  : "rounded-tl-sm border border-border bg-background"
              }`}
            >
              <div className="space-y-2 animate-pulse">
                {row.widths.map((widthClass) => (
                  <div
                    key={widthClass}
                    className={`h-4 rounded-full ${widthClass} ${
                      isUser ? "ml-auto bg-primary/20" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {isUser && (
              <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-soft text-primary/60">
                <UserRound className="size-4" />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start gap-3">
      <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-soft text-primary">
        <Bot className="size-4" />
      </span>
      <div className="rounded-3xl rounded-tl-sm border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
        Thinking...
      </div>
    </div>
  );
}

function MessageBubble({
  children,
  isUser,
}: {
  children: ReactNode;
  isUser: boolean;
}) {
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-soft text-primary">
          <Bot className="size-4" />
        </span>
      )}
      <div
        className={`max-w-[min(42rem,88%)] rounded-3xl px-4 py-3 text-sm ${
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm border border-border bg-background text-foreground"
        }`}
      >
        {children}
      </div>
      {isUser && (
        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-soft text-primary">
          <UserRound className="size-4" />
        </span>
      )}
    </div>
  );
}
