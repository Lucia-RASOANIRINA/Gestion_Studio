import { ProjectStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../common/errors/AppError";
import { assertTransition } from "./project-workflow";
import type { CreateProjectInput, ListProjectsQuery, UpdateProjectInput } from "./projects.validation";

async function generateReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PROD-${year}-`;
  const count = await prisma.project.count({ where: { reference: { startsWith: prefix } } });
  return `${prefix}${(count + 1).toString().padStart(3, "0")}`;
}

export async function listProjects(query: ListProjectsQuery) {
  const where: Prisma.ProjectWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.clientId ? { clientId: query.clientId } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { reference: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { client: { select: { id: true, name: true, segment: true } } },
    }),
    prisma.project.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { client: { select: { id: true, name: true, segment: true } } },
  });
}

export async function createProject(input: CreateProjectInput, createdById?: string) {
  const client = await prisma.client.findUnique({ where: { id: input.clientId } });
  if (!client) {
    throw AppError.badRequest("errors.validation_failed");
  }

  const reference = await generateReference();
  return prisma.project.create({
    data: { ...input, reference, createdById },
    include: { client: { select: { id: true, name: true, segment: true } } },
  });
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  return prisma.project.update({
    where: { id },
    data: input,
    include: { client: { select: { id: true, name: true, segment: true } } },
  });
}

export async function transitionProject(id: string, to: ProjectStatus) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw AppError.notFound();
  }
  assertTransition(project.status, to);
  return prisma.project.update({
    where: { id },
    data: { status: to },
    include: { client: { select: { id: true, name: true, segment: true } } },
  });
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
}
