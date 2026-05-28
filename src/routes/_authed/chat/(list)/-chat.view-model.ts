import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

type ConversationListItem = {
  id: string;
  title: string;
  updatedAt: string | Date;
};

export function useChatListViewModel() {
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

  const handleNavigateNew = () => {
    navigate({ to: "/chat/new" });
  };

  const handleNavigateConversation = (conversationId: string) => {
    navigate({
      to: "/chat/$conversationId",
      params: { conversationId },
    });
  };

  return {
    query,
    filteredItems,
    isLoading,
    isLoadingFeatures,
    chatEnabled,
    data,
    onQueryChange: setQuery,
    onNavigateNew: handleNavigateNew,
    onNavigateConversation: handleNavigateConversation,
  };
}
