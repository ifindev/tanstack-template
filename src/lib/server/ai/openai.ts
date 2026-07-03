import { createOpenAI } from "@ai-sdk/openai";
import { getAiConfig } from "./config";

export function getChatModel() {
  const config = getAiConfig();
  if (!config.chatEnabled || !config.apiKey || !config.model) {
    throw new Error("Chat is disabled because AI provider config is missing.");
  }

  const openai = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  return openai.chat(config.model);
}
