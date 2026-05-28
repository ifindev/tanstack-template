import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteType: "single" | "bulk";
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
};

export default function DeleteConversationDialog({
  open,
  onOpenChange,
  deleteType,
  selectedCount,
  onConfirm,
  onCancel,
  isPending,
}: Props) {
  const title =
    deleteType === "bulk"
      ? `Delete ${selectedCount} conversation${selectedCount === 1 ? "" : "s"}?`
      : "Delete conversation?";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
