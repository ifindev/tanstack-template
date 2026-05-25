import { z } from "zod";
import { DEFAULT_CONVERSATION_TITLE } from "./constants";

export const createConversationSchema = z.object({
  title: z.string().min(1).max(200).default(DEFAULT_CONVERSATION_TITLE),
});

export const renameConversationSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
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
