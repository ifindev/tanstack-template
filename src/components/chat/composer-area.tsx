import { AlertCircle, ArrowDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ComposerAreaProps = {
  input: string;
  isAtBottom: boolean;
  chatError: string | null;
  composerDisabled: boolean;
  canSubmit: boolean;
  chatEnabled: boolean;
  isLoadingFeatures: boolean;
  onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onScrollToBottom: () => void;
};

export default function ComposerArea({
  input,
  isAtBottom,
  chatError,
  composerDisabled,
  canSubmit,
  chatEnabled,
  isLoadingFeatures,
  onInputChange,
  onSubmit,
  onScrollToBottom,
}: ComposerAreaProps) {
  return (
    <div className="relative shrink-0 bg-background/92 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
      {!isAtBottom && (
        <div className="absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full shadow-md"
            onClick={onScrollToBottom}
          >
            <ArrowDown className="size-4" />
          </Button>
        </div>
      )}
      <div className="relative shrink-0">
        <div className="mx-auto w-full max-w-2xl space-y-3 px-4 sm:px-0">
          {!isLoadingFeatures && !chatEnabled && (
            <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Chat provider is not configured.</p>
                <p className="mt-1 text-destructive/85">
                  Set `AI_API_KEY` and `AI_MODEL` to send messages.
                </p>
              </div>
            </div>
          )}
          {chatError && (
            <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{chatError}</p>
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="surface-card flex flex-col gap-2 p-2">
              <Textarea
                value={input}
                onChange={onInputChange}
                placeholder={
                  chatEnabled ? "Write the next message..." : "Chat is disabled"
                }
                className="max-h-48 min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
                disabled={composerDisabled}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    onSubmit(
                      event as unknown as React.FormEvent<HTMLFormElement>,
                    );
                  }
                }}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!canSubmit}
                >
                  <Send className="size-4" />
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
