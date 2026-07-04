import { ProjectStatus, ServiceType, Currency } from "@prisma/client";
import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().trim().min(2).max(200),
  clientId: z.string().uuid(),
  serviceType: z.nativeEnum(ServiceType),
  description: z.string().trim().max(2000).optional(),
  budgetAmount: z.coerce.number().nonnegative().optional(),
  budgetCurrency: z.nativeEnum(Currency).default(Currency.MGA),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const transitionProjectSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
});

export const listProjectsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  clientId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type TransitionProjectInput = z.infer<typeof transitionProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
