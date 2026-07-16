import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import * as studiosService from "./studios.service";
import type { ListStudiosQuery } from "./studios.validation";

export async function listStudiosHandler(req: Request, res: Response) {
  const result = await studiosService.listStudios(req.validatedQuery as ListStudiosQuery);
  res.json(result);
}

export async function getStudioHandler(req: Request, res: Response) {
  const studio = await studiosService.getStudioById(req.params.id);
  if (!studio) throw AppError.notFound();
  res.json(studio);
}

export async function createStudioHandler(req: Request, res: Response) {
  const studio = await studiosService.createStudio(req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "studios.create",
    entity: "Studio",
    entityId: studio.id,
    ipAddress: req.ip,
  });
  res.status(201).json(studio);
}

export async function updateStudioHandler(req: Request, res: Response) {
  const studio = await studiosService.updateStudio(req.params.id, req.body);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "studios.update",
    entity: "Studio",
    entityId: studio.id,
    ipAddress: req.ip,
  });
  res.json(studio);
}

export async function deleteStudioHandler(req: Request, res: Response) {
  await studiosService.deleteStudio(req.params.id);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "studios.delete",
    entity: "Studio",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(204).send();
}
