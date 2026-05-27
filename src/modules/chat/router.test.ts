import { afterEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/shared/db/prisma";
import type { Context } from "@/shared/trpc/context";
import { chatRouter } from "./router";

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

  it("loads one conversation scoped to the current user", async () => {
    vi.mocked(prisma.conversation.findFirst).mockResolvedValueOnce(null);

    await expect(
      createCaller().getConversation({ id: "c1" }),
    ).resolves.toBeNull();

    expect(prisma.conversation.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "c1", userId: "u1" },
      }),
    );
  });
});
