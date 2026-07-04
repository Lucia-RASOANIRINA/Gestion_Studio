import type { Request, Response } from "express";

// TODO (Phase 4 — Planning & Réservations) : calendrier multi-vues, détection de
// conflits, rappels automatiques, export iCal/Google Calendar, liste d'attente.
export function listPlanningHandler(_req: Request, res: Response) {
  res.json({ message: "Module planning — à implémenter en phase 4.", items: [] });
}
