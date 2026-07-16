import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type { CreateEquipmentInput, ListEquipmentQuery, UpdateEquipmentInput } from "./equipment.validation";

export async function listEquipment(query: ListEquipmentQuery) {
  const where: Prisma.EquipmentWhereInput = {
    ...(query.category ? { category: query.category } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.studio ? { studio: query.studio } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { serialNumber: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.equipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.equipment.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getEquipmentById(id: string) {
  return prisma.equipment.findUnique({
    where: { id },
    include: { maintenanceRecords: { orderBy: { performedAt: "desc" } } },
  });
}

export async function listMaintenance(equipmentId: string) {
  return prisma.maintenanceRecord.findMany({
    where: { equipmentId },
    orderBy: { performedAt: "desc" },
  });
}

export async function addMaintenance(
  equipmentId: string,
  input: {
    description: string;
    performedAt?: Date;
    cost?: number | null;
    technician?: string;
    partsReplaced?: string;
  },
  createdById?: string
) {
  return prisma.maintenanceRecord.create({
    data: {
      equipmentId,
      description: input.description,
      performedAt: input.performedAt ?? new Date(),
      cost: input.cost ?? null,
      technician: input.technician ?? null,
      partsReplaced: input.partsReplaced ?? null,
      createdById,
    },
  });
}

export async function createEquipment(input: CreateEquipmentInput, createdById?: string) {
  return prisma.equipment.create({ data: { ...input, createdById } });
}

export async function updateEquipment(id: string, input: UpdateEquipmentInput) {
  return prisma.equipment.update({ where: { id }, data: input });
}

export async function deleteEquipment(id: string) {
  await prisma.equipment.delete({ where: { id } });
}
