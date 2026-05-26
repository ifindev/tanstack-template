import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ConversationPanel,
  getMessageText,
  type ConversationUiMessage,
} from "./conversation-panel";

const messages: ConversationUiMessage[] = [
  {
    id: "assistant-1",
    role: "assistant",
    parts: [{ type: "text", text: "Hello! How can I help?" }],
  },
  {
    id: "user-1",
    role: "user",
    parts: [{ type: "text", text: "Build me an app." }],
  },
];

describe("ConversationPanel", () => {
  it("renders skeleton bubbles while conversation history is loading", () => {
    const html = renderToStaticMarkup(
      <ConversationPanel
        isConversationLoading
        isResponding={false}
        messages={[]}
        title={null}
      />,
    );

    expect(html).toContain("Loading conversation history");
    expect(html).not.toContain("Start chatting about anything.");
  });

  it("renders the empty state only after loading completes with no messages", () => {
    const html = renderToStaticMarkup(
      <ConversationPanel
        isConversationLoading={false}
        isResponding={false}
        messages={[]}
        title="New conversation"
      />,
    );

    expect(html).toContain("Start chatting about anything.");
    expect(html).not.toContain("Loading conversation history");
  });

  it("renders loaded conversation messages in transcript order", () => {
    const html = renderToStaticMarkup(
      <ConversationPanel
        isConversationLoading={false}
        isResponding={false}
        messages={messages}
        title="Product shell"
      />,
    );

    expect(html).toContain("Hello! How can I help?");
    expect(html).toContain("Build me an app.");
    expect(html).not.toContain("Start chatting about anything.");
  });

  it("shows the responding UI only for live assistant generation", () => {
    const html = renderToStaticMarkup(
      <ConversationPanel
        isConversationLoading={false}
        isResponding
        messages={messages}
        title="Product shell"
      />,
    );

    expect(html).toContain("Responding");
    expect(html).toContain("Thinking...");
  });

  it("renders the title before the scrollable transcript container", () => {
    const html = renderToStaticMarkup(
      <ConversationPanel
        isConversationLoading={false}
        isResponding={false}
        messages={messages}
        title="Product shell"
      />,
    );

    expect(html.indexOf("Product shell")).toBeLessThan(
      html.indexOf('data-slot="scroll-area"'),
    );
  });
});

describe("getMessageText", () => {
  it("joins only text parts", () => {
    const text = getMessageText({
      id: "assistant-2",
      role: "assistant",
      parts: [
        { type: "text", text: "Hello" },
        { type: "step-start" },
        { type: "text", text: " world" },
      ],
    });

    expect(text).toBe("Hello world");
  });
});
