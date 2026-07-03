import { describe, expect, it } from "vitest";
import {
  buildProvisionalConversationTitle,
  normalizeConversationTitle,
} from "./chat.title";

describe("chat title helpers", () => {
  it("normalizes whitespace and trims wrapping quotes", () => {
    expect(
      normalizeConversationTitle('  "Plan   the   new   onboarding   flow"  '),
    ).toBe("Plan the new onboarding flow");
  });

  it("falls back to the default title when the prompt is blank", () => {
    expect(buildProvisionalConversationTitle("   \n\t  ")).toBe(
      "New conversation",
    );
  });

  it("caps provisional titles at 100 characters", () => {
    const prompt = "a".repeat(140);

    expect(buildProvisionalConversationTitle(prompt)).toHaveLength(100);
  });
});
