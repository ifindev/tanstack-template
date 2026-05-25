import { afterEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/shared/auth/better-auth";
import { prisma } from "@/shared/db/prisma";
import { handleChatPost } from "./chat";

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
});
