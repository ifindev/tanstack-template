import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Navbar } from "@/components/layout/navbar";
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
    <>
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Conversations</h1>
          <Button
            onClick={() => createMutation.mutate({ title: "New conversation" })}
            disabled={!chatEnabled || isLoadingFeatures}
          >
            New chat
          </Button>
        </div>

        {!isLoadingFeatures && !chatEnabled && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Chat is disabled because AI provider config is missing. Set
            AI_API_KEY and AI_MODEL to enable new conversations.
          </div>
        )}

        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {data?.items.length === 0 && (
          <p className="text-muted-foreground">
            No conversations yet. Start a new one!
          </p>
        )}

        <ul className="space-y-2">
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
                className="w-full rounded-lg border p-4 text-left hover:bg-accent"
              >
                <p className="font-medium">{conv.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(conv.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
