import { prisma } from "@/shared/db/prisma";
import type { MessageRole } from "./constants";

export async function createConversation(userId: string, title: string) {
  return prisma.conversation.create({ data: { userId, title } });
}

export async function listConversations(
  userId: string,
  { cursor, limit }: { cursor?: string; limit: number },
) {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    select: { id: true, title: true, updatedAt: true, createdAt: true },
  });
}

export async function getConversationWithMessages(userId: string, id: string) {
  return prisma.conversation.findFirst({
    where: { id, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function renameConversation(
  userId: string,
  id: string,
  title: string,
) {
  return prisma.conversation.updateMany({
    where: { id, userId },
    data: { title },
  });
}

export async function deleteConversation(userId: string, id: string) {
  return prisma.conversation.deleteMany({ where: { id, userId } });
}

export async function addMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
) {
  return prisma.message.create({ data: { conversationId, role, content } });
}
