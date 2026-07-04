import type { Request, Response } from "express";

// TODO (Phase 3 — Projets & Services) : workflow Devis→Validé→En cours→Révision→
// Livré→Facturé→Archivé, versioning des livrables, checklists, annotations sur
// forme d'onde, timeline Gantt.
export function listProjectsHandler(_req: Request, res: Response) {
  res.json({ message: "Module projects — à implémenter en phase 3.", items: [] });
}
