import type { Request, Response } from "express";

// TODO (Phase 5 — Ressources) : inventaire matériel, états, maintenance, stocks
// consommables, alertes de stock bas, QR code, amortissement, coût d'usage.
export function listResourcesHandler(_req: Request, res: Response) {
  res.json({ message: "Module resources — à implémenter en phase 5.", items: [] });
}
