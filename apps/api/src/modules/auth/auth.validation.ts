import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  code: z.string().trim().regex(/^\d{6}$/).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const twoFactorCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Code à 6 chiffres requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type TwoFactorCodeInput = z.infer<typeof twoFactorCodeSchema>;
