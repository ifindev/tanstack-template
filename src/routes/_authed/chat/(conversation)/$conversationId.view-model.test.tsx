// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useConversationViewModel } from "./$conversationId.view-model";

const mockUseParams = vi.fn();
const mockUseQuery = vi.fn();
const mockUseChatSession = vi.fn();
const mockUseChatScroll = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useParams: () => mockUseParams(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    chat: {
      getConversation: {
        useQuery: () => mockUseQuery(),
      },
    },
  },
}));

vi.mock("@/hooks/use-chat-session", () => ({
  useChatSession: () => mockUseChatSession(),
}));

vi.mock("@/hooks/use-chat-scroll", () => ({
  useChatScroll: () => mockUseChatScroll(),
}));

let latestViewModel: ReturnType<typeof useConversationViewModel> | null = null;

function ViewModelHarness() {
  latestViewModel = useConversationViewModel();
  return null;
}

describe("useConversationViewModel", () => {
  afterEach(() => {
    latestViewModel = null;
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("re-arms auto-follow before delegating a valid submit", async () => {
    const chatSubmit = vi.fn();
    const snapToBottom = vi.fn();

    mockUseParams.mockReturnValue({ conversationId: "conversation-1" });
    mockUseQuery.mockReturnValue({
      data: { title: "Product shell", messages: [] },
      isLoading: false,
    });
    mockUseChatSession.mockReturnValue({
      canSubmit: true,
      isResponding: false,
      messages: [],
      onSubmit: chatSubmit,
    });
    mockUseChatScroll.mockReturnValue({
      snapToBottom,
    });

    const harness = await renderHarness();
    const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    latestViewModel?.onSubmit(event);

    expect(snapToBottom).toHaveBeenCalledOnce();
    expect(chatSubmit).toHaveBeenCalledOnce();
    const scrollInvocationOrder = snapToBottom.mock.invocationCallOrder[0];
    const submitInvocationOrder = chatSubmit.mock.invocationCallOrder[0];

    if (
      scrollInvocationOrder === undefined ||
      submitInvocationOrder === undefined
    ) {
      throw new Error("Expected submit handlers to record invocation order");
    }

    expect(scrollInvocationOrder).toBeLessThan(submitInvocationOrder);

    harness.dispose();
  });

  it("skips auto-follow reactivation when submit is not valid", async () => {
    const chatSubmit = vi.fn();
    const snapToBottom = vi.fn();

    mockUseParams.mockReturnValue({ conversationId: "conversation-1" });
    mockUseQuery.mockReturnValue({
      data: { title: "Product shell", messages: [] },
      isLoading: false,
    });
    mockUseChatSession.mockReturnValue({
      canSubmit: false,
      isResponding: false,
      messages: [],
      onSubmit: chatSubmit,
    });
    mockUseChatScroll.mockReturnValue({
      snapToBottom,
    });

    const harness = await renderHarness();
    const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    latestViewModel?.onSubmit(event);

    expect(snapToBottom).not.toHaveBeenCalled();
    expect(chatSubmit).toHaveBeenCalledOnce();

    harness.dispose();
  });
});

async function renderHarness() {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<ViewModelHarness />);
  });

  return {
    dispose: () => {
      root.unmount();
      container.remove();
    },
  };
}
