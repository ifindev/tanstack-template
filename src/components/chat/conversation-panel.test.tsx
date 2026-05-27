import type { AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ConversationPanel, {
  type ConversationUiMessage,
  getMessageText,
} from "./conversation-panel";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

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

  it("renders assistant markdown for inline and fenced code blocks", () => {
    const html = renderToStaticMarkup(
      <ConversationPanel
        isConversationLoading={false}
        isResponding={false}
        messages={[
          {
            id: "assistant-markdown",
            role: "assistant",
            parts: [
              {
                type: "text",
                text: "Use `sum()` here.\n\n```ts\nconst total = 1;\n```",
              },
            ],
          },
        ]}
        title="Product shell"
      />,
    );

    expect(html).toContain("<code");
    expect(html).toContain("sum()");
    expect(html).toContain("const total = 1;");
    expect(html).toContain("Copy");
    expect(html).not.toContain("```");
  });

  it("renders assistant markdown lists, links, and tables as elements", () => {
    const html = renderToStaticMarkup(
      <ConversationPanel
        isConversationLoading={false}
        isResponding={false}
        messages={[
          {
            id: "assistant-structured",
            role: "assistant",
            parts: [
              {
                type: "text",
                text: "- First\n- Second\n\n| Name | Value |\n| --- | --- |\n| API | Ready |\n\n[Docs](https://example.com)",
              },
            ],
          },
        ]}
        title="Product shell"
      />,
    );

    expect(html).toContain("<ul");
    expect(html).toContain("<table");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
  });

  it("keeps user messages as literal plain text", () => {
    const html = renderToStaticMarkup(
      <ConversationPanel
        isConversationLoading={false}
        isResponding={false}
        messages={[
          {
            id: "user-markdown",
            role: "user",
            parts: [
              {
                type: "text",
                text: "Use `sum()` here.\n\n```ts\nconst total = 1;\n```",
              },
            ],
          },
        ]}
        title="Product shell"
      />,
    );

    expect(html).toContain("`sum()`");
    expect(html).toContain("```ts");
    expect(html).not.toContain("Copy");
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
