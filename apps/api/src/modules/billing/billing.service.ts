import { InvoiceStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../common/errors/AppError";
import { awardLoyaltyPoints } from "../clients/clients.service";
import type {
  AddPaymentInput,
  CreateInvoiceInput,
  ListInvoicesQuery,
  UpdateInvoiceInput,
} from "./billing.validation";

const invoiceInclude = {
  client: { select: { id: true, name: true, segment: true } },
  project: { select: { id: true, reference: true, title: true } },
  items: true,
  payments: { orderBy: { paidAt: "desc" } },
} satisfies Prisma.InvoiceInclude;

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{ include: typeof invoiceInclude }>;

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

/** Calcule sous-total, TVA, total, payé et solde à partir des lignes et paiements. */
export function withComputedTotals(invoice: InvoiceWithRelations) {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + toNumber(item.quantity) * toNumber(item.unitPrice),
    0
  );
  const taxRate = toNumber(invoice.taxRate);
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxAmount;
  const amountPaid = invoice.payments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  const balance = Math.max(total - amountPaid, 0);

  return {
    ...invoice,
    taxRate,
    totals: { subtotal, taxRate, taxAmount, total, amountPaid, balance },
  };
}

async function generateReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;
  const count = await prisma.invoice.count({ where: { reference: { startsWith: prefix } } });
  return `${prefix}${(count + 1).toString().padStart(3, "0")}`;
}

export async function listInvoices(query: ListInvoicesQuery) {
  const where: Prisma.InvoiceWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.clientId ? { clientId: query.clientId } : {}),
    ...(query.search
      ? {
          OR: [
            { reference: { contains: query.search, mode: "insensitive" } },
            { client: { name: { contains: query.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { issueDate: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: invoiceInclude,
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    items: rows.map(withComputedTotals),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getInvoiceById(id: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: invoiceInclude });
  return invoice ? withComputedTotals(invoice) : null;
}

export async function createInvoice(input: CreateInvoiceInput, createdById?: string) {
  const client = await prisma.client.findUnique({ where: { id: input.clientId } });
  if (!client) {
    throw AppError.badRequest("errors.validation_failed");
  }

  const reference = await generateReference();
  const invoice = await prisma.invoice.create({
    data: {
      reference,
      clientId: input.clientId,
      projectId: input.projectId ?? null,
      currency: input.currency,
      taxRate: input.taxRate,
      dueDate: input.dueDate ?? null,
      notes: input.notes ?? null,
      createdById,
      items: {
        create: input.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: invoiceInclude,
  });

  return withComputedTotals(invoice);
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound();
  if (
    existing.status === InvoiceStatus.PAID ||
    existing.status === InvoiceStatus.CANCELLED ||
    existing.signedAt
  ) {
    throw AppError.conflict("errors.conflict");
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      clientId: input.clientId,
      projectId: input.projectId,
      currency: input.currency,
      taxRate: input.taxRate,
      dueDate: input.dueDate,
      notes: input.notes,
      ...(input.items
        ? {
            items: {
              deleteMany: {},
              create: input.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            },
          }
        : {}),
    },
    include: invoiceInclude,
  });

  return withComputedTotals(invoice);
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound();

  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status },
    include: invoiceInclude,
  });
  return withComputedTotals(invoice);
}

/** Enregistre un paiement et met à jour automatiquement le statut (PARTIAL / PAID). */
export async function addPayment(id: string, input: AddPaymentInput, createdById?: string) {
  const existing = await getInvoiceById(id);
  if (!existing) throw AppError.notFound();

  await prisma.payment.create({
    data: {
      invoiceId: id,
      amount: input.amount,
      method: input.method,
      reference: input.reference ?? null,
      paidAt: input.paidAt ?? new Date(),
      createdById,
    },
  });

  // Crédite les points de fidélité du client sur le montant encaissé.
  await awardLoyaltyPoints(existing.client.id, input.amount);

  const refreshed = await getInvoiceById(id);
  if (!refreshed) throw AppError.notFound();

  // Recalcule le statut sauf si la facture est annulée.
  if (refreshed.status !== InvoiceStatus.CANCELLED) {
    const { total, amountPaid } = refreshed.totals;
    const nextStatus =
      amountPaid >= total && total > 0
        ? InvoiceStatus.PAID
        : amountPaid > 0
          ? InvoiceStatus.PARTIAL
          : refreshed.status;
    if (nextStatus !== refreshed.status) {
      return updateInvoiceStatus(id, nextStatus);
    }
  }

  return refreshed;
}

/** Enregistre la signature électronique et verrouille la facture. */
export async function signInvoice(id: string, signatureDataUrl: string, signedBy: string) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound();
  if (existing.signedAt) throw AppError.conflict("errors.conflict");
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { signatureDataUrl, signedBy, signedAt: new Date() },
    include: invoiceInclude,
  });
  return withComputedTotals(invoice);
}

export async function deleteInvoice(id: string) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound();
  await prisma.invoice.delete({ where: { id } });
}

/** Indicateurs globaux de facturation, tous statuts non annulés confondus. */
export async function getBillingSummary() {
  const invoices = await prisma.invoice.findMany({
    where: { status: { not: InvoiceStatus.CANCELLED } },
    include: invoiceInclude,
  });

  let invoiced = 0;
  let paid = 0;
  let outstanding = 0;
  let overdue = 0;
  const now = new Date();

  for (const raw of invoices) {
    const { totals, status, dueDate } = withComputedTotals(raw);
    invoiced += totals.total;
    paid += totals.amountPaid;
    outstanding += totals.balance;
    const isOverdue = dueDate && dueDate < now && status !== InvoiceStatus.PAID;
    if (status === InvoiceStatus.OVERDUE || isOverdue) {
      overdue += totals.balance;
    }
  }

  return {
    count: invoices.length,
    invoiced,
    paid,
    outstanding,
    overdue,
  };
}
