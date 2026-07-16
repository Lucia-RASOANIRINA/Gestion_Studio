import { z } from "zod";

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+261\d{9}$/, "phone")
      .optional()
      .nullable(),
    locale: z.enum(["fr", "en"]).optional(),
    theme: z.enum(["dark", "light", "system"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "empty" });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
