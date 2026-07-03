import { describe, expect, it } from "vitest";
import { parseAiConfig } from "./config";

describe("AI config", () => {
  it("disables chat when key is missing", () => {
    expect(parseAiConfig({ model: "gpt-4o-mini" }).chatEnabled).toBe(false);
  });

  it("disables chat when model is missing", () => {
    expect(parseAiConfig({ apiKey: "sk-test" }).chatEnabled).toBe(false);
  });

  it("enables chat with apiKey and model", () => {
    expect(
      parseAiConfig({ apiKey: "sk-test", model: "gpt-4o-mini" }),
    ).toMatchObject({
      apiKey: "sk-test",
      model: "gpt-4o-mini",
      chatEnabled: true,
    });
  });

  it("keeps optional base URL when provided", () => {
    expect(
      parseAiConfig({
        apiKey: "sk-or",
        baseURL: "https://openrouter.ai/api/v1",
        model: "openai/gpt-4o-mini",
      }),
    ).toMatchObject({
      baseURL: "https://openrouter.ai/api/v1",
      model: "openai/gpt-4o-mini",
      chatEnabled: true,
    });
  });
});
