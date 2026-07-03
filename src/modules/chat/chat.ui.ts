import type { UIMessage } from "ai";

export type ChatUiData = {
  "conversation-created": {
    conversationId: string;
  };
};

export type ChatUiMessage = UIMessage<unknown, ChatUiData>;

export const CONVERSATION_CREATED_DATA_PART = "data-conversation-created";
