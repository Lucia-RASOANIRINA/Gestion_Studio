import type { Request, Response } from "express";

// TODO (Phase 7 — Reporting & Analytics) : CA par période/service/client, taux
// d'occupation, productivité, marges, prévisionnel de trésorerie, alertes KPI.
export function getDashboardHandler(_req: Request, res: Response) {
  res.json({ message: "Module reporting — à implémenter en phase 7.", widgets: [] });
}
