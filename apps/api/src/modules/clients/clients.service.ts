import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type { CreateClientInput, ListClientsQuery, UpdateClientInput } from "./clients.validation";
import { pointsForPayment, withTier } from "./clients.loyalty";

/** Code unique du badge client électronique (ex. GS-C-A1B2C3). */
export function generateBadgeCode(): string {
  return `GS-C-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

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

  return { items: items.map(withTier), total, page: query.page, pageSize: query.pageSize };
}

export async function getClientById(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      _count: { select: { projects: true } },
    },
  });
  return client ? withTier(client) : null;
}

export async function createClient(input: CreateClientInput, createdById?: string) {
  // Badge client électronique généré automatiquement à l'ajout du client.
  const client = await prisma.client.create({
    data: { ...input, createdById, badgeCode: generateBadgeCode() },
  });
  return withTier(client);
}

export async function updateClient(id: string, input: UpdateClientInput) {
  const client = await prisma.client.update({ where: { id }, data: input });
  return withTier(client);
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
}

/** Active/désactive la blacklist d'un client (mauvais payeur, fraude…). */
export async function setBlacklist(id: string, isBlacklisted: boolean, reason?: string | null) {
  const client = await prisma.client.update({
    where: { id },
    data: { isBlacklisted, blacklistReason: isBlacklisted ? (reason ?? null) : null },
  });
  return withTier(client);
}

/** Crédite les points de fidélité d'un client suite à un paiement encaissé. */
export async function awardLoyaltyPoints(clientId: string, amountPaid: number) {
  const points = pointsForPayment(amountPaid);
  if (points <= 0) return;
  await prisma.client.update({
    where: { id: clientId },
    data: { loyaltyPoints: { increment: points } },
  });
}
