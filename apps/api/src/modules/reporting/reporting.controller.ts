import type { Request, Response } from "express";
import * as reportingService from "./reporting.service";

export async function getDashboardHandler(_req: Request, res: Response) {
  const dashboard = await reportingService.getDashboard();
  res.json(dashboard);
}
