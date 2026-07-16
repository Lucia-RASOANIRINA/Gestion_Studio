import { InvoiceStatus, ProjectStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

const COMPLETED_STATUSES: ProjectStatus[] = [
  ProjectStatus.DELIVERED,
  ProjectStatus.INVOICED,
  ProjectStatus.ARCHIVED,
];
const IN_PROGRESS_STATUSES: ProjectStatus[] = [ProjectStatus.IN_PROGRESS, ProjectStatus.REVIEW];

// Fenêtre d'ouverture théorique pour le taux d'occupation : 4 salles, 12 h/jour, 7 jours.
const STUDIO_COUNT = 4;
const OPEN_HOURS_PER_DAY = 12;

/** Tableau de bord analytique : indicateurs consolidés à partir des données existantes. */
export async function getDashboard() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  // Semaine courante (lundi 00:00 → dimanche 24:00).
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = lundi
  const startOfWeek = new Date(startOfToday.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    clientsCount,
    newClientsThisMonth,
    projectsGrouped,
    servicesGrouped,
    completedProjects,
    upcomingBookings,
    bookingsToday,
    bookingsThisWeek,
    weekSessions,
    equipmentGrouped,
    consumables,
    invoices,
    payments,
    recentClients,
    recentBookings,
    auditLogs,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.project.groupBy({ by: ["serviceType"], _count: { _all: true } }),
    prisma.project.findMany({
      where: { status: { in: COMPLETED_STATUSES } },
      select: { createdAt: true, updatedAt: true },
    }),
    prisma.booking.count({ where: { startAt: { gte: now } } }),
    prisma.booking.count({ where: { startAt: { gte: startOfToday, lt: endOfToday } } }),
    prisma.booking.count({ where: { startAt: { gte: startOfWeek, lt: endOfWeek } } }),
    prisma.booking.findMany({
      where: { type: "SESSION", startAt: { gte: startOfWeek, lt: endOfWeek } },
      select: { startAt: true, endAt: true },
    }),
    prisma.equipment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.consumable.findMany(),
    prisma.invoice.findMany({
      where: { status: { not: InvoiceStatus.CANCELLED } },
      include: {
        items: true,
        payments: true,
        client: { select: { id: true, name: true } },
        project: { select: { serviceType: true } },
      },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: sixMonthsAgo } },
      select: { amount: true, paidAt: true },
    }),
    prisma.client.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  // --- Finances ---
  let invoiced = 0;
  let paid = 0;
  let outstanding = 0;
  let revenueThisMonth = 0;
  let revenueThisYear = 0;
  const revenueByClient = new Map<string, { name: string; amount: number }>();
  const revenueByService = new Map<string, number>();

  for (const invoice of invoices) {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + toNumber(item.quantity) * toNumber(item.unitPrice),
      0
    );
    const total = subtotal + Math.round((subtotal * toNumber(invoice.taxRate)) / 100);
    const amountPaid = invoice.payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
    invoiced += total;
    paid += amountPaid;
    outstanding += Math.max(total - amountPaid, 0);

    const clientEntry = revenueByClient.get(invoice.clientId) ?? { name: invoice.client.name, amount: 0 };
    clientEntry.amount += total;
    revenueByClient.set(invoice.clientId, clientEntry);

    const service = invoice.project?.serviceType ?? "OTHER";
    revenueByService.set(service, (revenueByService.get(service) ?? 0) + total);
  }

  for (const payment of payments) {
    const amount = toNumber(payment.amount);
    if (payment.paidAt >= startOfMonth) revenueThisMonth += amount;
    if (payment.paidAt >= startOfYear) revenueThisYear += amount;
  }

  // --- Séries mensuelles (6 mois) ---
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return monthKey(d);
  });
  const emptySeries = () => new Map(months.map((m) => [m, 0]));

  const revenueSeries = emptySeries();
  for (const payment of payments) {
    const key = monthKey(payment.paidAt);
    if (revenueSeries.has(key)) revenueSeries.set(key, revenueSeries.get(key)! + toNumber(payment.amount));
  }

  const clientsSeries = emptySeries();
  for (const client of recentClients) {
    const key = monthKey(client.createdAt);
    if (clientsSeries.has(key)) clientsSeries.set(key, clientsSeries.get(key)! + 1);
  }

  const bookingsSeries = emptySeries();
  for (const booking of recentBookings) {
    const key = monthKey(booking.createdAt);
    if (bookingsSeries.has(key)) bookingsSeries.set(key, bookingsSeries.get(key)! + 1);
  }

  // --- Taux d'occupation (heures de session réservées cette semaine / capacité) ---
  const bookedHours = weekSessions.reduce(
    (sum, b) => sum + Math.max(0, (b.endAt.getTime() - b.startAt.getTime()) / 3_600_000),
    0
  );
  const capacityHours = STUDIO_COUNT * OPEN_HOURS_PER_DAY * 7;
  const occupancyRate = Math.min(100, Math.round((bookedHours / capacityHours) * 100));

  // --- Durée moyenne des projets terminés (proxy : updatedAt - createdAt) ---
  const avgProjectDurationDays = completedProjects.length
    ? Math.round(
        completedProjects.reduce(
          (sum, p) => sum + (p.updatedAt.getTime() - p.createdAt.getTime()) / 86_400_000,
          0
        ) / completedProjects.length
      )
    : 0;

  const projectsInProgress = projectsGrouped
    .filter((g) => IN_PROGRESS_STATUSES.includes(g.status))
    .reduce((sum, g) => sum + g._count._all, 0);
  const projectsCompleted = completedProjects.length;

  const lowStockCount = consumables.filter((c) => c.quantity <= c.lowStockThreshold).length;

  return {
    kpis: {
      clients: clientsCount,
      projects: projectsGrouped.reduce((sum, g) => sum + g._count._all, 0),
      projectsInProgress,
      projectsCompleted,
      newClientsThisMonth,
      upcomingBookings,
      bookingsToday,
      bookingsThisWeek,
      occupancyRate,
      avgProjectDurationDays,
      invoiced,
      paid,
      outstanding,
      revenueThisMonth,
      revenueThisYear,
      lowStockCount,
    },
    projectsByStatus: projectsGrouped.map((g) => ({ status: g.status, count: g._count._all })),
    equipmentByStatus: equipmentGrouped.map((g) => ({ status: g.status, count: g._count._all })),
    servicesMostRequested: servicesGrouped
      .map((g) => ({ service: g.serviceType, count: g._count._all }))
      .sort((a, b) => b.count - a.count),
    revenueByService: [...revenueByService.entries()]
      .map(([service, amount]) => ({ service, amount }))
      .sort((a, b) => b.amount - a.amount),
    revenueByMonth: months.map((m) => ({ month: m, amount: revenueSeries.get(m)! })),
    bookingsByMonth: months.map((m) => ({ month: m, count: bookingsSeries.get(m)! })),
    newClientsByMonth: months.map((m) => ({ month: m, count: clientsSeries.get(m)! })),
    topClients: [...revenueByClient.values()].sort((a, b) => b.amount - a.amount).slice(0, 5),
    recentActivity: auditLogs.map((log) => ({
      action: log.action,
      entity: log.entity,
      user: log.user ? `${log.user.firstName} ${log.user.lastName}`.trim() : null,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}
