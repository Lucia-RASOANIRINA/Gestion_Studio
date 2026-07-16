import { ClientSegment } from "@prisma/client";
import { PHONE_REGEX } from "@gestion-studio/shared";
import { z } from "zod";

const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, "Le téléphone doit être au format +261 suivi de 9 chiffres")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createClientSchema = z.object({
  name: z.string().trim().min(2).max(200),
  segment: z.nativeEnum(ClientSegment).default(ClientSegment.OTHER),
  email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  phone: phoneSchema,
  address: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const blacklistClientSchema = z.object({
  isBlacklisted: z.boolean(),
  reason: z.string().trim().max(500).optional().nullable(),
});

export const listClientsQuerySchema = z.object({
  search: z.string().trim().optional(),
  segment: z.nativeEnum(ClientSegment).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
export type BlacklistClientInput = z.infer<typeof blacklistClientSchema>;
