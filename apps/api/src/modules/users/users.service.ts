import { prisma } from "../../config/prisma";

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      locale: true,
      isActive: true,
      roles: { select: { role: { select: { id: true, name: true } } } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      locale: true,
      isActive: true,
      roles: { select: { role: { select: { id: true, name: true } } } },
      createdAt: true,
    },
  });
}
