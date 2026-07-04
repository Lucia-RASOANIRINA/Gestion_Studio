import type { Request, Response } from "express";

// TODO (Phase 6 — Facturation & Finances) : cycle devis→commande→facture,
// acomptes, Mobile Money, export comptable, cachets freelances, multi-devise.
export function listInvoicesHandler(_req: Request, res: Response) {
  res.json({ message: "Module billing — à implémenter en phase 6.", items: [] });
}
