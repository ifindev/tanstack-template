import { afterEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/server/db/prisma";
import type { Context } from "@/lib/server/trpc/context";
import { chatRouter } from "./chat.router";

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
  vi.clearAllMocks();
});

describe("chat router", () => {
  it("lists conversations for the current user", async () => {
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([] as never);

    await expect(
      createCaller().listConversations({ limit: 20 }),
    ).resolves.toEqual({
      items: [],
      nextCursor: undefined,
    });
  });

  it("throws NOT_FOUND when conversation is missing", async () => {
    vi.mocked(prisma.conversation.findFirst).mockResolvedValueOnce(null);

    await expect(
      createCaller().getConversation({ id: "c1" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws NOT_FOUND when rename affects zero rows", async () => {
    vi.mocked(prisma.conversation.updateMany).mockResolvedValueOnce({
      count: 0,
    });

    await expect(
      createCaller().renameConversation({ id: "c1", title: "New title" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws NOT_FOUND when delete affects zero rows", async () => {
    vi.mocked(prisma.conversation.deleteMany).mockResolvedValueOnce({
      count: 0,
    });

    await expect(
      createCaller().deleteConversation({ id: "c1" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
