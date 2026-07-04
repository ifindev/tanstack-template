import { createFileRoute } from "@tanstack/react-router";
import ComposerArea from "@/components/chat/composer-area";
import ConversationPanel from "@/components/chat/conversation-panel";
import { PageContainer } from "@/components/layout/editorial";
import { useNewConversationViewModel } from "./-new.view-model";

export const Route = createFileRoute("/_authed/chat/(new)/new")({
  component: NewConversationPage,
});

function NewConversationPage() {
  const vm = useNewConversationViewModel();

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <PageContainer className="flex h-full min-h-0 flex-col py-6 sm:py-8">
          <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col">
            <ConversationPanel
              contentRef={vm.scroll.contentRef}
              viewportRef={vm.scroll.viewportRef}
              isConversationLoading={false}
              isResponding={vm.chatSession.isResponding}
              messages={vm.chatSession.messages}
              title={undefined}
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
        onSubmit={vm.chatSession.onSubmit}
        onScrollToBottom={vm.scroll.scrollToBottom}
      />
    </main>
  );
}
