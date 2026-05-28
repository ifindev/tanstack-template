import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Loader2,
  MessageSquarePlus,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { PageContainer } from "@/components/layout/editorial";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChatListViewModel } from "./chat.view-model";

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
    <main className="flex-1 overflow-y-auto py-6 sm:py-8">
      <PageContainer className="max-w-6xl space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-heading text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
              Chats
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={vm.onToggleSelectMode}
            >
              {vm.selectMode ? "Cancel" : "Select chats"}
            </Button>
            <Button
              onClick={vm.onNavigateNew}
              disabled={!vm.chatEnabled || vm.isLoadingFeatures || vm.selectMode}
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

        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={vm.query}
              onChange={(event) => vm.onQueryChange(event.target.value)}
              placeholder="Search chats..."
              className="h-10 rounded-xl bg-background pr-4 pl-10 text-sm"
            />
          </div>

          {vm.selectMode && vm.selectedIds.size > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-soft px-4 py-2.5">
              <span className="text-sm text-muted-foreground">
                {vm.selectedIds.size} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={vm.onDeselectAll}
                >
                  Deselect all
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={vm.onRequestBulkDelete}
                >
                  <Trash2 className="size-3.5" />
                  Delete selected
                </Button>
              </div>
            </div>
          )}

          {vm.selectMode && vm.filteredItems.length > 0 && vm.selectedIds.size === 0 && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-soft px-4 py-2.5">
              <span className="text-sm text-muted-foreground">
                Select conversations to delete
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={vm.onSelectAll}
              >
                Select all
              </Button>
            </div>
          )}

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
              <li key={conv.id} className="group flex items-center">
                {vm.selectMode && (
                  <label className="flex shrink-0 cursor-pointer items-center pl-1 pr-3 py-6">
                    <input
                      type="checkbox"
                      checked={vm.selectedIds.has(conv.id)}
                      onChange={() => vm.onToggleSelect(conv.id)}
                      className="size-4 cursor-pointer rounded border-border accent-primary"
                    />
                    <span className="sr-only">Select {conv.title}</span>
                  </label>
                )}
                <button
                  type="button"
                  onClick={() =>
                    vm.selectMode
                      ? vm.onToggleSelect(conv.id)
                      : vm.onNavigateConversation(conv.id)
                  }
                  className="min-w-0 flex-1 bg-transparent px-5 py-6 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
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
                {!vm.selectMode && (
                  <div className="flex shrink-0 items-center gap-1 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        vm.onStartEdit(conv.id, conv.title);
                      }}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Edit title</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        vm.onRequestDelete(conv.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>

      <Dialog
        open={vm.editingConversation !== null}
        onOpenChange={(open) => !open && vm.onCancelEdit()}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Edit title</DialogTitle>
          </DialogHeader>
          <Input
            value={vm.editTitle}
            onChange={(e) => vm.onEditTitleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && vm.onConfirmEdit()}
            placeholder="Conversation title"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={vm.onCancelEdit}>
              Cancel
            </Button>
            <Button
              onClick={vm.onConfirmEdit}
              disabled={!vm.editTitle.trim() || vm.isRenaming}
            >
              {vm.isRenaming ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={vm.pendingDelete !== null}
        onOpenChange={(open) => !open && vm.onCancelDelete()}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {vm.pendingDelete?.type === "bulk"
                ? `Delete ${vm.selectedIds.size} conversation${vm.selectedIds.size === 1 ? "" : "s"}?`
                : "Delete conversation?"}
            </DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={vm.onCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={vm.onConfirmDelete}
              disabled={vm.isDeleting}
            >
              {vm.isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
