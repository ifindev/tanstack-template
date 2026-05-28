import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/editorial";
import ConversationPanel from "@/components/chat/conversation-panel";
import ComposerArea from "@/components/chat/composer-area";
import { useConversationViewModel } from "./$conversationId.view-model";

export const Route = createFileRoute(
  "/_authed/chat/(conversation)/$conversationId",
)({
  component: ConversationPage,
});

function ConversationPage() {
  const vm = useConversationViewModel();

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <PageContainer className="flex h-full min-h-0 flex-col py-6 sm:py-8">
          <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col">
            <ConversationPanel
              contentRef={vm.scroll.contentRef}
              viewportRef={vm.scroll.viewportRef}
              isConversationLoading={vm.isLoading}
              isResponding={vm.chatSession.isResponding}
              messages={vm.chatSession.messages}
              title={vm.title}
            />
          </div>
        </PageContainer>
      </div>

      <ComposerArea
        input={vm.chatSession.input}
        isAtBottom={vm.scroll.isAtBottom}
        chatError={vm.chatSession.chatError}
        composerDisabled={vm.chatSession.composerDisabled}
        canSubmit={vm.chatSession.canSubmit}
        chatEnabled={vm.chatSession.chatEnabled}
        isLoadingFeatures={vm.chatSession.isLoadingFeatures}
        onInputChange={vm.chatSession.onInputChange}
        onSubmit={vm.onSubmit}
        onScrollToBottom={vm.scroll.scrollToBottom}
      />
    </main>
  );
}
