import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/client/trpc";

type ConversationListItem = {
  id: string;
  title: string;
  updatedAt: string | Date;
};

type DeleteTarget = { type: "single"; id: string } | { type: "bulk" };

export function useChatListViewModel() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [query, setQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingConversation, setEditingConversation] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);

  const { data: features, isLoading: isLoadingFeatures } =
    trpc.config.features.useQuery();
  const { data, isLoading } = trpc.chat.listConversations.useQuery({
    limit: 20,
  });

  const renameMutation = trpc.chat.renameConversation.useMutation({
    onSuccess: () => {
      utils.chat.listConversations.invalidate();
      setEditingConversation(null);
    },
  });

  const deleteMutation = trpc.chat.deleteConversation.useMutation({
    onSuccess: () => {
      utils.chat.listConversations.invalidate();
      setPendingDelete(null);
    },
  });

  const bulkDeleteMutation = trpc.chat.deleteConversations.useMutation({
    onSuccess: () => {
      utils.chat.listConversations.invalidate();
      setSelectedIds(new Set());
      setSelectMode(false);
      setPendingDelete(null);
    },
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

  const handleToggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(
      new Set(filteredItems.map((item: ConversationListItem) => item.id)),
    );
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleStartEdit = (id: string, title: string) => {
    setEditingConversation({ id, title });
    setEditTitle(title);
  };

  const handleCancelEdit = () => {
    setEditingConversation(null);
  };

  const handleConfirmEdit = () => {
    if (!editingConversation || !editTitle.trim()) return;
    renameMutation.mutate({
      id: editingConversation.id,
      title: editTitle.trim(),
    });
  };

  const handleRequestDelete = (id: string) => {
    setPendingDelete({ type: "single", id });
  };

  const handleRequestBulkDelete = () => {
    setPendingDelete({ type: "bulk" });
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "single") {
      deleteMutation.mutate({ id: pendingDelete.id });
    } else {
      bulkDeleteMutation.mutate({ ids: Array.from(selectedIds) });
    }
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  return {
    query,
    filteredItems,
    isLoading,
    isLoadingFeatures,
    chatEnabled,
    data,
    selectMode,
    selectedIds,
    editingConversation,
    editTitle,
    pendingDelete,
    isRenaming: renameMutation.isPending,
    isDeleting: deleteMutation.isPending || bulkDeleteMutation.isPending,
    onQueryChange: setQuery,
    onNavigateNew: handleNavigateNew,
    onNavigateConversation: handleNavigateConversation,
    onToggleSelectMode: handleToggleSelectMode,
    onToggleSelect: handleToggleSelect,
    onSelectAll: handleSelectAll,
    onDeselectAll: handleDeselectAll,
    onStartEdit: handleStartEdit,
    onCancelEdit: handleCancelEdit,
    onConfirmEdit: handleConfirmEdit,
    onEditTitleChange: setEditTitle,
    onRequestDelete: handleRequestDelete,
    onRequestBulkDelete: handleRequestBulkDelete,
    onConfirmDelete: handleConfirmDelete,
    onCancelDelete: handleCancelDelete,
  };
}
