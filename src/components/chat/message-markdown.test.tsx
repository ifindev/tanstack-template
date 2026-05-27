import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  getMarkdownTextContent,
  renderMessageMarkdownAsync,
} from "./message-markdown";

describe("renderMessageMarkdownAsync", () => {
  it("renders highlighted token markup for fenced code with a language tag", async () => {
    const html = renderToStaticMarkup(
      await renderMessageMarkdownAsync("```ts\nconst total = 1\n```"),
    );

    expect(html).toContain('data-language="ts"');
    expect(html).toContain('data-theme="github-light"');
    expect(html).toContain('data-line=""');
    expect(html).toContain("color:#");
  });

  it("falls back to plaintext for unlabeled fenced code blocks", async () => {
    const html = renderToStaticMarkup(
      await renderMessageMarkdownAsync("```\nplain\n```"),
    );

    expect(html).toContain('data-language="text"');
    expect(html).toContain(">plain<");
    expect(html).not.toContain("color:#");
  });

  it("keeps inline code unhighlighted", async () => {
    const html = renderToStaticMarkup(
      await renderMessageMarkdownAsync("Inline `sum()` text"),
    );

    expect(html).toContain(
      'class="rounded-md bg-surface-soft px-1.5 py-0.5 font-mono text-[0.8125rem] break-words text-foreground"',
    );
    expect(html).toContain(">sum()</code>");
    expect(html).not.toContain('data-theme="github-light"');
  });
});

describe("getMarkdownTextContent", () => {
  it("extracts raw code text from nested highlighted token spans", () => {
    const text = getMarkdownTextContent(
      <span data-line="">
        <span style={{ color: "#D73A49" }}>const</span>
        <span style={{ color: "#005CC5" }}> total</span>
        <span style={{ color: "#D73A49" }}> =</span>
        <span style={{ color: "#005CC5" }}> 1</span>
      </span>,
    );

    expect(text).toBe("const total = 1");
  });
});
