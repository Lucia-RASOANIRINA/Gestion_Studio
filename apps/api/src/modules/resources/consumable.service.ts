import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../common/errors/AppError";
import { applyStockAdjustment, isLowStock } from "./resources-stock";
import type { CreateConsumableInput, ListConsumablesQuery, UpdateConsumableInput } from "./consumable.validation";

function withLowStockFlag<T extends { quantity: number; lowStockThreshold: number }>(consumable: T) {
  return { ...consumable, isLowStock: isLowStock(consumable.quantity, consumable.lowStockThreshold) };
}

export async function listConsumables(query: ListConsumablesQuery) {
  const where: Prisma.ConsumableWhereInput = query.search
    ? { name: { contains: query.search, mode: "insensitive" } }
    : {};

  const all = await prisma.consumable.findMany({ where, orderBy: { name: "asc" } });
  const withFlags = all.map(withLowStockFlag);
  const filtered = query.lowStockOnly ? withFlags.filter((item) => item.isLowStock) : withFlags;

  const start = (query.page - 1) * query.pageSize;
  const items = filtered.slice(start, start + query.pageSize);

  return { items, total: filtered.length, page: query.page, pageSize: query.pageSize };
}

export async function getConsumableById(id: string) {
  const consumable = await prisma.consumable.findUnique({ where: { id } });
  return consumable ? withLowStockFlag(consumable) : null;
}

export async function createConsumable(input: CreateConsumableInput, createdById?: string) {
  const consumable = await prisma.consumable.create({ data: { ...input, createdById } });
  return withLowStockFlag(consumable);
}

export async function updateConsumable(id: string, input: UpdateConsumableInput) {
  const consumable = await prisma.consumable.update({ where: { id }, data: input });
  return withLowStockFlag(consumable);
}

export async function adjustConsumableStock(id: string, delta: number) {
  const consumable = await prisma.consumable.findUnique({ where: { id } });
  if (!consumable) {
    throw AppError.notFound();
  }

  let nextQuantity: number;
  try {
    nextQuantity = applyStockAdjustment(consumable.quantity, delta);
  } catch {
    throw AppError.badRequest("errors.insufficient_stock");
  }

  const updated = await prisma.consumable.update({ where: { id }, data: { quantity: nextQuantity } });
  return withLowStockFlag(updated);
}

export async function deleteConsumable(id: string) {
  await prisma.consumable.delete({ where: { id } });
}
