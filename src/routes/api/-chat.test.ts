import { afterEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/shared/auth/better-auth";
import { prisma } from "@/shared/db/prisma";
import { handleChatPost } from "./chat";

const aiMocks = vi.hoisted(() => ({
  capturedDataParts: [] as unknown[],
  convertToModelMessagesMock: vi.fn(async (messages) => messages),
  generateTextMock: vi.fn(),
  streamTextMock: vi.fn(),
}));

vi.mock("ai", async () => {
  return {
    convertToModelMessages: aiMocks.convertToModelMessagesMock,
    createUIMessageStream: ({
      execute,
    }: {
      execute: (options: {
        writer: {
          write: (part: unknown) => void;
          merge: (stream: unknown) => void;
        };
      }) => void;
    }) => {
      execute({
        writer: {
          write: (part) => {
            aiMocks.capturedDataParts.push(part);
          },
          merge: () => {},
        },
      });
      return new ReadableStream();
    },
    createUIMessageStreamResponse: () => new Response(null, { status: 200 }),
    generateText: aiMocks.generateTextMock,
    streamText: aiMocks.streamTextMock,
  };
});

vi.mock("@/shared/auth/better-auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/shared/logger", () => ({
  logger: {
    child: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

vi.mock("@/shared/sentry/server", () => ({
  Sentry: {
    captureException: vi.fn(),
  },
}));

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  aiMocks.capturedDataParts.length = 0;
  vi.clearAllMocks();
});

describe("/api/chat", () => {
  it("returns 503 and does not persist messages when chat is disabled", async () => {
    delete process.env.AI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_MODEL;
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "u1", email: "user@example.com" },
      session: { id: "s1", userId: "u1" },
    } as never);

    const response = await handleChatPost(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              id: "m1",
              role: "user",
              parts: [{ type: "text", text: "Hi" }],
            },
          ],
          conversationId: "c1",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: "CHAT_DISABLED",
      message: "Chat is disabled because AI provider config is missing.",
    });
    expect(response.status).toBe(503);
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  it("returns 400 and does not persist when the last user message is blank", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_MODEL = "gpt-4o-mini";
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "u1", email: "user@example.com" },
      session: { id: "s1", userId: "u1" },
    } as never);

    const response = await handleChatPost(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              id: "m1",
              role: "user",
              parts: [{ type: "text", text: "   " }],
            },
          ],
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: "EMPTY_USER_MESSAGE",
      message: "A non-empty user message is required.",
    });
    expect(response.status).toBe(400);
    expect(prisma.conversation.create).not.toHaveBeenCalled();
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  it("creates a conversation on first send, persists both messages, and emits the new id", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_MODEL = "gpt-4o-mini";
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "u1", email: "user@example.com" },
      session: { id: "s1", userId: "u1" },
    } as never);
    vi.mocked(prisma.conversation.create).mockResolvedValueOnce({
      id: "c-new",
      userId: "u1",
      title: "Plan a launch checklist",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    vi.mocked(prisma.message.create)
      .mockResolvedValueOnce({
        id: "m-user",
        conversationId: "c-new",
        role: "user",
        content: "Plan a launch checklist",
        createdAt: new Date(),
      } as never)
      .mockResolvedValueOnce({
        id: "m-assistant",
        conversationId: "c-new",
        role: "assistant",
        content: "Here is the plan.",
        createdAt: new Date(),
      } as never);
    vi.mocked(prisma.conversation.updateMany).mockResolvedValueOnce({
      count: 1,
    } as never);
    aiMocks.generateTextMock.mockResolvedValueOnce({
      text: "Launch checklist",
    });
    aiMocks.streamTextMock.mockImplementationOnce(
      ({
        onFinish,
      }: {
        onFinish?: (result: { text: string }) => Promise<void>;
      }) => ({
        consumeStream: () => {
          void onFinish?.({ text: "Here is the plan." });
        },
        toUIMessageStream: () => new ReadableStream(),
      }),
    );

    const response = await handleChatPost(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              id: "m1",
              role: "user",
              parts: [{ type: "text", text: "Plan a launch checklist" }],
            },
          ],
        }),
      }),
    );

    await Promise.resolve();

    expect(response.status).toBe(200);
    expect(prisma.conversation.create).toHaveBeenCalledWith({
      data: { userId: "u1", title: "Plan a launch checklist" },
    });
    expect(prisma.message.create).toHaveBeenNthCalledWith(1, {
      data: {
        conversationId: "c-new",
        role: "user",
        content: "Plan a launch checklist",
      },
    });
    expect(prisma.message.create).toHaveBeenNthCalledWith(2, {
      data: {
        conversationId: "c-new",
        role: "assistant",
        content: "Here is the plan.",
      },
    });
    await vi.waitFor(() => {
      expect(prisma.conversation.updateMany).toHaveBeenCalledWith({
        where: { id: "c-new", userId: "u1" },
        data: { title: "Launch checklist" },
      });
    });
    expect(aiMocks.capturedDataParts).toContainEqual({
      type: "data-conversation-created",
      data: { conversationId: "c-new" },
      transient: true,
    });
  });
});
