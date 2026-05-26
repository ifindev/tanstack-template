import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Loader2, MessageSquarePlus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/editorial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [query, setQuery] = useState("");
  const { data: features, isLoading: isLoadingFeatures } =
    trpc.config.features.useQuery();
  const { data, isLoading } = trpc.chat.listConversations.useQuery({
    limit: 20,
  });
  const chatEnabled = features?.chatEnabled ?? false;
  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item: ConversationListItem) =>
      item.title.toLowerCase().includes(normalizedQuery),
    );
  }, [data?.items, query]);
  const createMutation = trpc.chat.createConversation.useMutation({
    onSuccess: (conv) =>
      navigate({
        to: "/chat/$conversationId",
        params: { conversationId: conv.id },
      }),
  });

  return (
    <main className="flex-1 py-6 sm:py-8">
      <PageContainer className="max-w-6xl space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-heading text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
              Chats
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto">
              Select chats
            </Button>
            <Button
              onClick={() =>
                createMutation.mutate({ title: "New conversation" })
              }
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
        </div>

        {!isLoadingFeatures && !chatEnabled && (
          <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Chat provider is not configured.</p>
              <p className="mt-1 text-destructive/85">
                Set `AI_API_KEY` and `AI_MODEL` to enable new conversations.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chats..."
              className="h-10 rounded-xl bg-background pr-4 pl-10 text-sm"
            />
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 px-1 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading conversations...
            </div>
          )}

          {!isLoading && data?.items.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background px-6 py-14 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-soft">
                <MessageSquarePlus className="size-5 text-primary" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold tracking-[-0.03em] text-foreground">
                No conversations yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted-foreground">
                Start the first thread once the AI provider is configured.
              </p>
            </div>
          )}

          {!isLoading &&
            data &&
            data.items.length > 0 &&
            filteredItems.length === 0 && (
              <div className="px-1 py-10 text-sm text-muted-foreground">
                No chats match “{query}”.
              </div>
            )}

          <ul className="divide-y divide-border/80">
            {filteredItems.map((conv: ConversationListItem) => (
              <li key={conv.id}>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/chat/$conversationId",
                      params: { conversationId: conv.id },
                    })
                  }
                  className="w-full bg-transparent px-5 py-6 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                >
                  <div className="flex items-center justify-between gap-6">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-medium leading-[1.4] text-foreground">
                        {conv.title}
                      </span>
                      <span className="mt-2 block text-sm text-muted-foreground sm:hidden">
                        {formatDistanceToNow(new Date(conv.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
                      {formatDistanceToNow(new Date(conv.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </main>
  );
}
