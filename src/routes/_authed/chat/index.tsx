import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

type ConversationListItem = {
  id: string;
  title: string;
  updatedAt: string | Date;
};

export const Route = createFileRoute("/_authed/chat/")({
  component: ChatListPage,
});

function ChatListPage() {
  const navigate = useNavigate();
  const { data: features, isLoading: isLoadingFeatures } =
    trpc.config.features.useQuery();
  const { data, isLoading } = trpc.chat.listConversations.useQuery({
    limit: 20,
  });
  const chatEnabled = features?.chatEnabled ?? false;
  const createMutation = trpc.chat.createConversation.useMutation({
    onSuccess: (conv) =>
      navigate({
        to: "/chat/$conversationId",
        params: { conversationId: conv.id },
      }),
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Chat</p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Conversations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Continue an existing thread or start a new AI conversation.
          </p>
        </div>
        <Button
          onClick={() => createMutation.mutate({ title: "New conversation" })}
          disabled={
            !chatEnabled || isLoadingFeatures || createMutation.isPending
          }
          className="w-full sm:w-auto"
        >
          {createMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MessageSquarePlus className="size-4" />
          )}
          New chat
        </Button>
      </div>

      {!isLoadingFeatures && !chatEnabled && (
        <div className="mb-6 flex gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Chat provider is not configured.</p>
            <p className="mt-1 text-destructive/85">
              Set AI_API_KEY and AI_MODEL to enable new conversations.
            </p>
          </div>
        </div>
      )}

      <section className="rounded-lg border bg-card text-card-foreground shadow-xs">
        <div className="border-b px-4 py-3">
          <h2 className="font-heading text-sm font-medium">Recent threads</h2>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading conversations...
          </div>
        )}

        {!isLoading && data?.items.length === 0 && (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-md bg-muted">
              <MessageSquarePlus className="size-5 text-muted-foreground" />
            </div>
            <h2 className="mt-3 font-heading text-base font-medium">
              No conversations yet
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Start a new thread when the AI provider is configured.
            </p>
          </div>
        )}

        <ul className="divide-y">
          {data?.items.map((conv: ConversationListItem) => (
            <li key={conv.id}>
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/chat/$conversationId",
                    params: { conversationId: conv.id },
                  })
                }
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {conv.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Updated{" "}
                    {formatDistanceToNow(new Date(conv.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </span>
                <span className="hidden shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline">
                  Open
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
