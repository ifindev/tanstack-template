import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  getMarkdownTextContent,
  renderMessageMarkdownAsync,
} from "./message-markdown";

describe("renderMessageMarkdownAsync", () => {
  it("renders markdown headings with explicit chat typography classes", async () => {
    const html = renderToStaticMarkup(
      await renderMessageMarkdownAsync(
        "# Title\n\n## Section\n\n### Detail\n\n#### Small\n\n##### Tiny\n\n###### Label",
      ),
    );

    expect(html).toContain("<h1");
    expect(html).toContain(">Title</h1>");
    expect(html).toContain("text-[1.75rem]");
    expect(html).toContain("tracking-[-0.04em]");

    expect(html).toContain("<h2");
    expect(html).toContain(">Section</h2>");
    expect(html).toContain("text-[1.4rem]");
    expect(html).toContain("tracking-[-0.03em]");

    expect(html).toContain("<h3");
    expect(html).toContain(">Detail</h3>");
    expect(html).toContain("text-[1.15rem]");

    expect(html).toContain("<h4");
    expect(html).toContain(">Small</h4>");
    expect(html).toContain("text-base");

    expect(html).toContain("<h5");
    expect(html).toContain(">Tiny</h5>");
    expect(html).toContain("text-[0.9375rem]");

    expect(html).toContain("<h6");
    expect(html).toContain(">Label</h6>");
    expect(html).toContain("uppercase");
    expect(html).toContain("font-heading");
    expect(html).toContain("text-[0.75rem]");
  });

  it("renders inline code inside headings with heading-friendly chip styling", async () => {
    const html = renderToStaticMarkup(
      await renderMessageMarkdownAsync("## Key Features of `agent.md`"),
    );

    expect(html).toContain("<h2");
    expect(html).toContain("Key Features of <code");
    expect(html).toContain("[&amp;_code]:bg-surface-soft");
    expect(html).toContain("[&amp;_code]:rounded-md");
    expect(html).toContain("[&amp;_code]:text-[0.78em]");
    expect(html).toContain("[&amp;_code]:text-inherit");
    expect(html).toContain("[&amp;_code]:whitespace-nowrap");
  });

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
