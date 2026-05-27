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
              bottomRef={vm.chatSession.bottomRef}
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
        isAtBottom={vm.chatSession.isAtBottom}
        chatError={vm.chatSession.chatError}
        composerDisabled={vm.chatSession.composerDisabled}
        chatEnabled={vm.chatSession.chatEnabled}
        bottomRef={vm.chatSession.bottomRef}
        isLoadingFeatures={vm.chatSession.isLoadingFeatures}
        onInputChange={vm.chatSession.onInputChange}
        onSubmit={vm.chatSession.onSubmit}
        onScrollToBottom={vm.chatSession.onScrollToBottom}
      />
    </main>
  );
}
