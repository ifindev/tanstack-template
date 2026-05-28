import { z } from "zod";
import { MAX_CONVERSATION_TITLE_LENGTH } from "./constants";

export const renameConversationSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(MAX_CONVERSATION_TITLE_LENGTH),
});

export const deleteConversationSchema = z.object({
  id: z.string(),
});

export const getConversationSchema = z.object({
  id: z.string(),
});

export const listConversationsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
});

export const bulkDeleteConversationsSchema = z.object({
  ids: z.array(z.string()).min(1),
});
