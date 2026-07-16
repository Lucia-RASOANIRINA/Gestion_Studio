import { EquipmentCategory, EquipmentStatus, StudioRoom } from "@prisma/client";
import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const createEquipmentSchema = z.object({
  name: z.string().trim().min(2).max(200),
  category: z.nativeEnum(EquipmentCategory).default(EquipmentCategory.OTHER),
  serialNumber: optionalText(100),
  brand: optionalText(120),
  model: optionalText(120),
  location: optionalText(200),
  status: z.nativeEnum(EquipmentStatus).default(EquipmentStatus.AVAILABLE),
  studio: z.nativeEnum(StudioRoom).optional(),
  purchaseDate: z.coerce.date().optional(),
  warrantyUntil: z.coerce.date().optional(),
  purchasePrice: z.coerce.number().nonnegative().optional(),
  currentValue: z.coerce.number().nonnegative().optional(),
  photoUrl: z.string().trim().url().max(500).optional().or(z.literal("").transform(() => undefined)),
  nextMaintenanceAt: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const updateEquipmentSchema = createEquipmentSchema.partial();

export const createMaintenanceSchema = z.object({
  description: z.string().trim().min(2).max(500),
  performedAt: z.coerce.date().optional(),
  cost: z.coerce.number().nonnegative().max(1_000_000_000).optional().nullable(),
  technician: optionalText(120),
  partsReplaced: optionalText(500),
});

export const listEquipmentQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.nativeEnum(EquipmentCategory).optional(),
  status: z.nativeEnum(EquipmentStatus).optional(),
  studio: z.nativeEnum(StudioRoom).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type ListEquipmentQuery = z.infer<typeof listEquipmentQuerySchema>;
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
