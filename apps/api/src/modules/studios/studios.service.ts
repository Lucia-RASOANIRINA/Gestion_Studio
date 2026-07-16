import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../common/errors/AppError";
import type { CreateStudioInput, ListStudiosQuery, UpdateStudioInput } from "./studios.validation";

export async function listStudios(query: ListStudiosQuery) {
  const where: Prisma.StudioWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.type ? { type: query.type } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.studio.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.studio.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getStudioById(id: string) {
  return prisma.studio.findUnique({ where: { id } });
}

export async function createStudio(input: CreateStudioInput, createdById?: string) {
  return prisma.studio.create({ data: { ...input, createdById } });
}

export async function updateStudio(id: string, input: UpdateStudioInput) {
  const existing = await prisma.studio.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound();
  return prisma.studio.update({ where: { id }, data: input });
}

export async function deleteStudio(id: string) {
  const existing = await prisma.studio.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound();
  await prisma.studio.delete({ where: { id } });
}
