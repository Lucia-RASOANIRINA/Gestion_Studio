import { z } from "zod";

export const createConsumableSchema = z.object({
  name: z.string().trim().min(2).max(200),
  unit: z.string().trim().min(1).max(50).default("unité"),
  quantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  notes: z.string().trim().max(2000).optional(),
});

export const updateConsumableSchema = createConsumableSchema.partial();

export const adjustConsumableSchema = z.object({
  delta: z.coerce.number().int(),
});

export const listConsumablesQuerySchema = z.object({
  search: z.string().trim().optional(),
  lowStockOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateConsumableInput = z.infer<typeof createConsumableSchema>;
export type UpdateConsumableInput = z.infer<typeof updateConsumableSchema>;
export type AdjustConsumableInput = z.infer<typeof adjustConsumableSchema>;
export type ListConsumablesQuery = z.infer<typeof listConsumablesQuerySchema>;
