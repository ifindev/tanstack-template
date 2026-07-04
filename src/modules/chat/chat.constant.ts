export const MESSAGE_ROLE = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;

export type MessageRole = (typeof MESSAGE_ROLE)[keyof typeof MESSAGE_ROLE];

export const DEFAULT_CONVERSATION_TITLE = "New conversation";
export const MAX_CONVERSATION_TITLE_LENGTH = 100;
