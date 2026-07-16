import { InvoiceStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

export type NotificationSeverity = "info" | "warning" | "danger";

export interface Notification {
  type: "low_stock" | "overdue_invoice" | "maintenance_due";
  severity: NotificationSeverity;
  entity: string;
  entityId: string;
  /** Titre déjà lisible (nom de l'équipement/consommable ou référence facture). */
  title: string;
  /** Donnée contextuelle (quantité, montant, jours restants). */
  meta: number;
  date: string | null;
}

const MAINTENANCE_HORIZON_DAYS = 15;
const FEED_LIMIT = 60;

/** Fil de notifications persistant (événements), plus le nombre de non-lues. */
export async function getFeed() {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: FEED_LIMIT }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);
  return { items, unreadCount };
}

/** Marque une notification comme lue. */
export async function markRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

/** Marque toutes les notifications comme lues. */
export async function markAllRead() {
  const result = await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  return { updated: result.count };
}

/**
 * Alertes calculées à la volée à partir des données métier : stock bas,
 * factures en retard et maintenances à prévoir. Aucune table dédiée.
 */
export async function getAlerts(): Promise<{ items: Notification[]; count: number }> {
  const now = new Date();
  const horizon = new Date(now.getTime() + MAINTENANCE_HORIZON_DAYS * 24 * 60 * 60 * 1000);

  const [consumables, invoices, equipment] = await Promise.all([
    prisma.consumable.findMany(),
    prisma.invoice.findMany({
      where: { status: { notIn: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED] } },
      include: { items: true, payments: true, client: { select: { name: true } } },
    }),
    prisma.equipment.findMany({
      where: { nextMaintenanceAt: { not: null, lte: horizon } },
    }),
  ]);

  const items: Notification[] = [];

  for (const c of consumables) {
    if (c.quantity <= c.lowStockThreshold) {
      items.push({
        type: "low_stock",
        severity: c.quantity === 0 ? "danger" : "warning",
        entity: "Consumable",
        entityId: c.id,
        title: c.name,
        meta: c.quantity,
        date: null,
      });
    }
  }

  for (const invoice of invoices) {
    if (!invoice.dueDate || invoice.dueDate >= now) continue;
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + toNumber(item.quantity) * toNumber(item.unitPrice),
      0
    );
    const total = subtotal + Math.round((subtotal * toNumber(invoice.taxRate)) / 100);
    const paid = invoice.payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
    const balance = total - paid;
    if (balance <= 0) continue;
    items.push({
      type: "overdue_invoice",
      severity: "danger",
      entity: "Invoice",
      entityId: invoice.id,
      title: `${invoice.reference} — ${invoice.client.name}`,
      meta: balance,
      date: invoice.dueDate.toISOString(),
    });
  }

  for (const eq of equipment) {
    if (!eq.nextMaintenanceAt) continue;
    const daysLeft = Math.ceil((eq.nextMaintenanceAt.getTime() - now.getTime()) / 86_400_000);
    items.push({
      type: "maintenance_due",
      severity: daysLeft < 0 ? "danger" : "info",
      entity: "Equipment",
      entityId: eq.id,
      title: eq.name,
      meta: daysLeft,
      date: eq.nextMaintenanceAt.toISOString(),
    });
  }

  // Les plus urgentes d'abord (danger > warning > info).
  const rank: Record<NotificationSeverity, number> = { danger: 0, warning: 1, info: 2 };
  items.sort((a, b) => rank[a.severity] - rank[b.severity]);

  return { items, count: items.length };
}
