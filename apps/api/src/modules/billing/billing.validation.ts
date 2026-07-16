import { z } from "zod";
import { Currency, InvoiceStatus, PaymentMethod } from "@prisma/client";

export const listInvoicesQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  clientId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const invoiceItemSchema = z.object({
  description: z.string().trim().min(2).max(300),
  quantity: z.coerce.number().positive().max(100000),
  unitPrice: z.coerce.number().min(0).max(1_000_000_000),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  projectId: z.string().uuid().optional().nullable(),
  currency: z.nativeEnum(Currency).default(Currency.MGA),
  taxRate: z.coerce.number().min(0).max(100).default(20),
  dueDate: z.coerce.date().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "Au moins une ligne est requise."),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  items: z.array(invoiceItemSchema).min(1).optional(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
});

export const signInvoiceSchema = z.object({
  // Image de la signature au format data URL PNG (base64).
  signatureDataUrl: z
    .string()
    .regex(/^data:image\/png;base64,/, "signature")
    .max(2_000_000),
  signedBy: z.string().trim().min(2).max(120),
});

export const addPaymentSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000_000),
  method: z.nativeEnum(PaymentMethod).default(PaymentMethod.MOBILE_MONEY),
  reference: z.string().trim().max(120).optional().nullable(),
  paidAt: z.coerce.date().optional(),
});

export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
export type SignInvoiceInput = z.infer<typeof signInvoiceSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
export type AddPaymentInput = z.infer<typeof addPaymentSchema>;
