export interface AiConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  chatEnabled: boolean;
}

type AiEnv = Partial<
  Record<"AI_API_KEY" | "AI_BASE_URL" | "AI_MODEL" | "OPENAI_API_KEY", string>
>;

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getAiConfig(env: AiEnv = process.env): AiConfig {
  const apiKey = clean(env.AI_API_KEY) ?? clean(env.OPENAI_API_KEY);
  const baseURL = clean(env.AI_BASE_URL);
  const model = clean(env.AI_MODEL);

  return {
    apiKey,
    baseURL,
    model,
    chatEnabled: Boolean(apiKey && model),
  };
}

export function isChatEnabled(env: AiEnv = process.env): boolean {
  return getAiConfig(env).chatEnabled;
}

export function chatModelId(env: AiEnv = process.env): string | undefined {
  return getAiConfig(env).model;
}
