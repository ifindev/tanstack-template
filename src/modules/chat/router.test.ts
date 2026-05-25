import type { TRPCError } from "@trpc/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/shared/db/prisma";
import type { Context } from "@/shared/trpc/context";
import { chatRouter } from "./router";

const originalEnv = { ...process.env };

function createCaller() {
  return chatRouter.createCaller({
    session: { id: "s1", userId: "u1" },
    user: { id: "u1", email: "user@example.com" },
    prisma,
    redis: {},
    authRateLimiter: {},
    ip: "127.0.0.1",
    startTime: Date.now(),
  } as Context);
}

afterEach(() => {
  process.env = { ...originalEnv };
  vi.clearAllMocks();
});

describe("chat router", () => {
  it("blocks conversation creation when chat is disabled", async () => {
    delete process.env.AI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_MODEL;

    await expect(
      createCaller().createConversation({ title: "New conversation" }),
    ).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
      message: "Chat is disabled because AI provider config is missing.",
    } satisfies Partial<TRPCError>);
    expect(prisma.conversation.create).not.toHaveBeenCalled();
  });

  it("allows conversation creation when chat is enabled", async () => {
    process.env.AI_API_KEY = "sk-test";
    process.env.AI_MODEL = "gpt-4o-mini";
    const fake = {
      id: "c1",
      userId: "u1",
      title: "New conversation",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.conversation.create).mockResolvedValueOnce(fake as never);

    await expect(
      createCaller().createConversation({ title: "New conversation" }),
    ).resolves.toBe(fake);
  });

  it("still allows listing conversations when chat is disabled", async () => {
    delete process.env.AI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_MODEL;
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([] as never);

    await expect(
      createCaller().listConversations({ limit: 20 }),
    ).resolves.toEqual({
      items: [],
      nextCursor: undefined,
    });
  });
});
