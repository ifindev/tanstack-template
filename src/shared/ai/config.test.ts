import { describe, expect, it } from "vitest";
import { getAiConfig } from "./config";

describe("AI config", () => {
  it("disables chat when key is missing", () => {
    expect(getAiConfig({ AI_MODEL: "gpt-4o-mini" }).chatEnabled).toBe(false);
  });

  it("disables chat when model is missing", () => {
    expect(getAiConfig({ AI_API_KEY: "sk-test" }).chatEnabled).toBe(false);
  });

  it("disables chat when key and model are blank", () => {
    expect(getAiConfig({ AI_API_KEY: " ", AI_MODEL: "\t" }).chatEnabled).toBe(
      false,
    );
  });

  it("enables chat with AI_API_KEY and AI_MODEL", () => {
    expect(
      getAiConfig({ AI_API_KEY: "sk-test", AI_MODEL: "gpt-4o-mini" }),
    ).toMatchObject({
      apiKey: "sk-test",
      model: "gpt-4o-mini",
      chatEnabled: true,
    });
  });

  it("uses OPENAI_API_KEY as a legacy fallback", () => {
    expect(
      getAiConfig({
        OPENAI_API_KEY: "sk-openai",
        AI_MODEL: "gpt-4o-mini",
      }),
    ).toMatchObject({
      apiKey: "sk-openai",
      chatEnabled: true,
    });
  });

  it("prefers AI_API_KEY over OPENAI_API_KEY", () => {
    expect(
      getAiConfig({
        AI_API_KEY: "sk-ai",
        OPENAI_API_KEY: "sk-openai",
        AI_MODEL: "gpt-4o-mini",
      }).apiKey,
    ).toBe("sk-ai");
  });

  it("keeps optional base URL when provided", () => {
    expect(
      getAiConfig({
        AI_API_KEY: "sk-or",
        AI_BASE_URL: "https://openrouter.ai/api/v1",
        AI_MODEL: "openai/gpt-4o-mini",
      }),
    ).toMatchObject({
      baseURL: "https://openrouter.ai/api/v1",
      model: "openai/gpt-4o-mini",
      chatEnabled: true,
    });
  });
});
