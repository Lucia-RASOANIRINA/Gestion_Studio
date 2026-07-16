import { z } from "zod";
import { Currency, ExpenseCategory } from "@prisma/client";

export const listExpensesQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const createExpenseSchema = z.object({
  label: z.string().trim().min(2).max(200),
  category: z.nativeEnum(ExpenseCategory).default(ExpenseCategory.OTHER),
  amount: z.coerce.number().positive().max(1_000_000_000),
  currency: z.nativeEnum(Currency).default(Currency.MGA),
  incurredAt: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
