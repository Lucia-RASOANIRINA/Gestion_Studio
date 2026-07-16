import { InvoiceStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../common/errors/AppError";
import type { CreateExpenseInput, ListExpensesQuery, UpdateExpenseInput } from "./finance.validation";

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

export async function listExpenses(query: ListExpensesQuery) {
  const where: Prisma.ExpenseWhereInput = {
    ...(query.category ? { category: query.category } : {}),
    ...(query.search ? { label: { contains: query.search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { incurredAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.expense.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function createExpense(input: CreateExpenseInput, createdById?: string) {
  return prisma.expense.create({
    data: {
      label: input.label,
      category: input.category,
      amount: input.amount,
      currency: input.currency,
      incurredAt: input.incurredAt ?? new Date(),
      notes: input.notes ?? null,
      createdById,
    },
  });
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound();
  return prisma.expense.update({ where: { id }, data: input });
}

export async function deleteExpense(id: string) {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound();
  await prisma.expense.delete({ where: { id } });
}

/**
 * Tableau de trésorerie : entrées (paiements encaissés) vs sorties (dépenses),
 * solde, prévisionnel (factures non annulées restant à encaisser) et flux
 * mensuels sur 6 mois, plus répartition des dépenses par catégorie.
 */
export async function getTreasury() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [payments, expenses, openInvoices] = await Promise.all([
    prisma.payment.findMany({ select: { amount: true, paidAt: true } }),
    prisma.expense.findMany({ select: { amount: true, incurredAt: true, category: true } }),
    prisma.invoice.findMany({
      where: { status: { not: InvoiceStatus.CANCELLED } },
      include: { items: true, payments: true },
    }),
  ]);

  const inflow = payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
  const outflow = expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);

  // Prévisionnel : solde restant dû sur les factures ouvertes.
  let expectedInflow = 0;
  for (const invoice of openInvoices) {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + toNumber(item.quantity) * toNumber(item.unitPrice),
      0
    );
    const total = subtotal + Math.round((subtotal * toNumber(invoice.taxRate)) / 100);
    const paid = invoice.payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
    expectedInflow += Math.max(total - paid, 0);
  }

  const months = Array.from({ length: 6 }, (_, i) =>
    monthKey(new Date(now.getFullYear(), now.getMonth() - (5 - i), 1))
  );
  const inflowByMonth = new Map(months.map((m) => [m, 0]));
  const outflowByMonth = new Map(months.map((m) => [m, 0]));
  for (const p of payments) {
    const key = monthKey(p.paidAt);
    if (inflowByMonth.has(key)) inflowByMonth.set(key, inflowByMonth.get(key)! + toNumber(p.amount));
  }
  for (const e of expenses) {
    const key = monthKey(e.incurredAt);
    if (outflowByMonth.has(key)) outflowByMonth.set(key, outflowByMonth.get(key)! + toNumber(e.amount));
  }

  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + toNumber(e.amount));
  }

  return {
    inflow,
    outflow,
    balance: inflow - outflow,
    expectedInflow,
    cashflowByMonth: months.map((m) => ({
      month: m,
      inflow: inflowByMonth.get(m)!,
      outflow: outflowByMonth.get(m)!,
    })),
    expensesByCategory: [...byCategory.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}
