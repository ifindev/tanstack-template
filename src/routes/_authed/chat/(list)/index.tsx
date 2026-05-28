import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Loader2, MessageSquarePlus, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/editorial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatListViewModel } from "./-chat.view-model";

type ConversationListItem = {
  id: string;
  title: string;
  updatedAt: string | Date;
};

export const Route = createFileRoute("/_authed/chat/(list)/")({
  component: ChatListPage,
});

function ChatListPage() {
  const vm = useChatListViewModel();

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
              onClick={vm.onNavigateNew}
              disabled={!vm.chatEnabled || vm.isLoadingFeatures}
              className="w-full sm:w-auto"
            >
              <MessageSquarePlus className="size-4" />
              New chat
            </Button>
          </div>
        </div>

        {!vm.isLoadingFeatures && !vm.chatEnabled && (
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
              value={vm.query}
              onChange={(event) => vm.onQueryChange(event.target.value)}
              placeholder="Search chats..."
              className="h-10 rounded-xl bg-background pr-4 pl-10 text-sm"
            />
          </div>

          {vm.isLoading && (
            <div className="flex items-center gap-2 px-1 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading conversations...
            </div>
          )}

          {!vm.isLoading && vm.data?.items.length === 0 && (
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

          {!vm.isLoading &&
            vm.data &&
            vm.data.items.length > 0 &&
            vm.filteredItems.length === 0 && (
              <div className="px-1 py-10 text-sm text-muted-foreground">
                No chats match "{vm.query}".
              </div>
            )}

          <ul className="divide-y divide-border/80">
            {vm.filteredItems.map((conv: ConversationListItem) => (
              <li key={conv.id}>
                <button
                  type="button"
                  onClick={() => vm.onNavigateConversation(conv.id)}
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
