import { prisma } from "@/shared/db/prisma";

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(id: string, data: { name: string }) {
  return prisma.user.update({ where: { id }, data });
}
