import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import * as consumableService from "./consumable.service";
import type { ListConsumablesQuery } from "./consumable.validation";

export async function listConsumablesHandler(req: Request, res: Response) {
  const result = await consumableService.listConsumables(req.validatedQuery as ListConsumablesQuery);
  res.json(result);
}

export async function getConsumableHandler(req: Request, res: Response) {
  const consumable = await consumableService.getConsumableById(req.params.id);
  if (!consumable) {
    throw AppError.notFound();
  }
  res.json(consumable);
}

export async function createConsumableHandler(req: Request, res: Response) {
  const consumable = await consumableService.createConsumable(req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "resources.consumable.create",
    entity: "Consumable",
    entityId: consumable.id,
    ipAddress: req.ip,
  });
  res.status(201).json(consumable);
}

export async function updateConsumableHandler(req: Request, res: Response) {
  const existing = await consumableService.getConsumableById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  const consumable = await consumableService.updateConsumable(req.params.id, req.body);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "resources.consumable.update",
    entity: "Consumable",
    entityId: consumable.id,
    ipAddress: req.ip,
  });
  res.json(consumable);
}

export async function adjustConsumableHandler(req: Request, res: Response) {
  const consumable = await consumableService.adjustConsumableStock(req.params.id, req.body.delta);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "resources.consumable.adjust",
    entity: "Consumable",
    entityId: consumable.id,
    metadata: { delta: req.body.delta },
    ipAddress: req.ip,
  });
  res.json(consumable);
}

export async function deleteConsumableHandler(req: Request, res: Response) {
  const existing = await consumableService.getConsumableById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  await consumableService.deleteConsumable(req.params.id);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "resources.consumable.delete",
    entity: "Consumable",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(204).send();
}
