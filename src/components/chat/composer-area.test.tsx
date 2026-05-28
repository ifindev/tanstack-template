import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ComposerArea from "./composer-area";

describe("ComposerArea", () => {
  it("disables the send button when canSubmit is false", () => {
    const html = renderToStaticMarkup(
      <ComposerArea
        input="Ready to send"
        isAtBottom
        chatError={null}
        composerDisabled={false}
        canSubmit={false}
        chatEnabled
        isLoadingFeatures={false}
        onInputChange={() => {}}
        onSubmit={() => {}}
        onScrollToBottom={() => {}}
      />,
    );

    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled=""/);
  });

  it("leaves the send button enabled when canSubmit is true", () => {
    const html = renderToStaticMarkup(
      <ComposerArea
        input=""
        isAtBottom
        chatError={null}
        composerDisabled={false}
        canSubmit
        chatEnabled
        isLoadingFeatures={false}
        onInputChange={() => {}}
        onSubmit={() => {}}
        onScrollToBottom={() => {}}
      />,
    );

    expect(html).toMatch(/<button[^>]*type="submit"/);
    expect(html).not.toMatch(/<button[^>]*type="submit"[^>]*disabled=""/);
  });
});
