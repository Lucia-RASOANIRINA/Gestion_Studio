import type { Request, Response } from "express";

// TODO (Phase 2 — Clients & Contacts) : fiches client, artistes/labels, historique
// d'interactions, segmentation, droits/royalties, fidélité, score de fiabilité.
export function listClientsHandler(_req: Request, res: Response) {
  res.json({ message: "Module clients — à implémenter en phase 2.", items: [] });
}
