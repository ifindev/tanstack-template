import { describe, expect, it, vi } from "vitest";
import { MESSAGE_ROLE } from "@/modules/chat/constants";
import {
  addMessage,
  createConversation,
  deleteConversation,
  getConversationWithMessages,
  listConversations,
  renameConversation,
} from "@/modules/chat/service";
import { prisma } from "@/shared/db/prisma";

describe("chat service", () => {
  it("createConversation calls prisma.conversation.create", async () => {
    const fake = {
      id: "c1",
      userId: "u1",
      title: "Hello",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.conversation.create).mockResolvedValueOnce(fake as never);
    const result = await createConversation("u1", "Hello");
    expect(prisma.conversation.create).toHaveBeenCalledWith({
      data: { userId: "u1", title: "Hello" },
    });
    expect(result).toBe(fake);
  });

  it("listConversations returns paginated results", async () => {
    const items = [
      { id: "c1", title: "A", updatedAt: new Date(), createdAt: new Date() },
    ];
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce(
      items as never,
    );
    const result = await listConversations("u1", { limit: 20 });
    expect(result).toEqual(items);
  });

  it("getConversationWithMessages scopes to userId", async () => {
    vi.mocked(prisma.conversation.findFirst).mockResolvedValueOnce(null);
    const result = await getConversationWithMessages("u1", "c1");
    expect(prisma.conversation.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "c1", userId: "u1" } }),
    );
    expect(result).toBeNull();
  });

  it("renameConversation uses updateMany to scope by userId", async () => {
    vi.mocked(prisma.conversation.updateMany).mockResolvedValueOnce({
      count: 1,
    });
    await renameConversation("u1", "c1", "New title");
    expect(prisma.conversation.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "u1" },
      data: { title: "New title" },
    });
  });

  it("deleteConversation uses deleteMany to scope by userId", async () => {
    vi.mocked(prisma.conversation.deleteMany).mockResolvedValueOnce({
      count: 1,
    });
    await deleteConversation("u1", "c1");
    expect(prisma.conversation.deleteMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "u1" },
    });
  });

  it("addMessage persists a message", async () => {
    const fake = {
      id: "m1",
      conversationId: "c1",
      role: MESSAGE_ROLE.USER,
      content: "Hi",
      createdAt: new Date(),
    };
    vi.mocked(prisma.message.create).mockResolvedValueOnce(fake as never);
    const result = await addMessage("c1", MESSAGE_ROLE.USER, "Hi");
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: { conversationId: "c1", role: MESSAGE_ROLE.USER, content: "Hi" },
    });
    expect(result).toBe(fake);
  });
});
