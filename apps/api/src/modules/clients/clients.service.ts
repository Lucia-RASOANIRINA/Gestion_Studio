import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type { CreateClientInput, ListClientsQuery, UpdateClientInput } from "./clients.validation";

export async function listClients(query: ListClientsQuery) {
  const where: Prisma.ClientWhereInput = {
    ...(query.segment ? { segment: query.segment } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
            { phone: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { _count: { select: { projects: true } } },
    }),
    prisma.client.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      _count: { select: { projects: true } },
    },
  });
}

export async function createClient(input: CreateClientInput, createdById?: string) {
  return prisma.client.create({
    data: { ...input, createdById },
  });
}

export async function updateClient(id: string, input: UpdateClientInput) {
  return prisma.client.update({
    where: { id },
    data: input,
  });
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
}
