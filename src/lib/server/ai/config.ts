import { env } from "@/lib/server/env";

export interface AiConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  chatEnabled: boolean;
}

export function parseAiConfig(input: {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}): AiConfig {
  return {
    apiKey: input.apiKey,
    baseURL: input.baseURL,
    model: input.model,
    chatEnabled: Boolean(input.apiKey && input.model),
  };
}

export function getAiConfig(): AiConfig {
  return parseAiConfig({
    apiKey: env.aiApiKey,
    baseURL: env.aiBaseUrl,
    model: env.aiModel,
  });
}

export function isChatEnabled(): boolean {
  return env.chatEnabled;
}

export function chatModelId(): string | undefined {
  return env.aiModel;
}
