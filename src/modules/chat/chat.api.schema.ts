import { z } from "zod";

export const MAX_CHAT_MESSAGES = 100;
export const MAX_MESSAGE_CONTENT_LENGTH = 32_000;

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().max(MAX_MESSAGE_CONTENT_LENGTH),
});

const messagePartSchema = z.union([
  textPartSchema,
  z.object({ type: z.string() }).passthrough(),
]);

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(messagePartSchema).min(1),
});

export const chatApiRequestSchema = z.object({
  id: z.string().optional(),
  conversationId: z.string().optional(),
  messages: z.array(uiMessageSchema).min(1).max(MAX_CHAT_MESSAGES),
});

export type ChatApiRequest = z.infer<typeof chatApiRequestSchema>;
