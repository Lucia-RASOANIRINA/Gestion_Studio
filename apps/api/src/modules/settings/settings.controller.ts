import type { Request, Response } from "express";

// TODO (Phase 8 — Paramètres avancés) : infos entreprise, devises, taxes,
// numérotation, modèles de documents/contrats, workflows personnalisables,
// webhooks/API sortante.
export function getSettingsHandler(_req: Request, res: Response) {
  res.json({ message: "Module settings — à implémenter en phase 8." });
}
