import { generateText } from "ai";
import { getChatModel } from "@/lib/server/ai/openai";
import {
  DEFAULT_CONVERSATION_TITLE,
  MAX_CONVERSATION_TITLE_LENGTH,
} from "./chat.constant";

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number) {
  return value.slice(0, maxLength).trim();
}

export function normalizeConversationTitle(value: string) {
  const normalized = collapseWhitespace(value).replace(/^["']+|["']+$/g, "");
  return truncate(normalized, MAX_CONVERSATION_TITLE_LENGTH);
}

export function buildProvisionalConversationTitle(prompt: string) {
  const title = normalizeConversationTitle(prompt);
  return title || DEFAULT_CONVERSATION_TITLE;
}

export async function generateConversationTitle(prompt: string) {
  const fallbackTitle = buildProvisionalConversationTitle(prompt);
  const { text } = await generateText({
    model: getChatModel(),
    system:
      "You create concise conversation titles. Return only the title text with no quotes or extra commentary.",
    prompt: `Summarize this initial user request as a conversation title under ${MAX_CONVERSATION_TITLE_LENGTH} characters:\n\n${prompt}`,
    maxOutputTokens: 60,
  });

  return normalizeConversationTitle(text) || fallbackTitle;
}
