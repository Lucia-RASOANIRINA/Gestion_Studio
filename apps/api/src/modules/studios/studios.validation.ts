import { z } from "zod";
import { StudioStatus, StudioType } from "@prisma/client";

export const listStudiosQuerySchema = z.object({
  status: z.nativeEnum(StudioStatus).optional(),
  type: z.nativeEnum(StudioType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const createStudioSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.nativeEnum(StudioType).default(StudioType.RECORDING),
  capacity: z.coerce.number().int().min(1).max(1000).default(1),
  hourlyPrice: z.coerce.number().min(0).max(1_000_000_000).optional().nullable(),
  status: z.nativeEnum(StudioStatus).default(StudioStatus.AVAILABLE),
  description: z.string().trim().max(2000).optional().nullable(),
  equipmentSummary: z.string().trim().max(2000).optional().nullable(),
  photoUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("").transform(() => null)),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const updateStudioSchema = createStudioSchema.partial();

export type ListStudiosQuery = z.infer<typeof listStudiosQuerySchema>;
export type CreateStudioInput = z.infer<typeof createStudioSchema>;
export type UpdateStudioInput = z.infer<typeof updateStudioSchema>;
