import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import * as equipmentService from "./equipment.service";
import type { ListEquipmentQuery } from "./equipment.validation";

export async function listEquipmentHandler(req: Request, res: Response) {
  const result = await equipmentService.listEquipment(req.validatedQuery as ListEquipmentQuery);
  res.json(result);
}

export async function getEquipmentHandler(req: Request, res: Response) {
  const equipment = await equipmentService.getEquipmentById(req.params.id);
  if (!equipment) {
    throw AppError.notFound();
  }
  res.json(equipment);
}

export async function createEquipmentHandler(req: Request, res: Response) {
  const equipment = await equipmentService.createEquipment(req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "resources.equipment.create",
    entity: "Equipment",
    entityId: equipment.id,
    ipAddress: req.ip,
  });
  res.status(201).json(equipment);
}

export async function updateEquipmentHandler(req: Request, res: Response) {
  const existing = await equipmentService.getEquipmentById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  const equipment = await equipmentService.updateEquipment(req.params.id, req.body);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "resources.equipment.update",
    entity: "Equipment",
    entityId: equipment.id,
    ipAddress: req.ip,
  });
  res.json(equipment);
}

export async function deleteEquipmentHandler(req: Request, res: Response) {
  const existing = await equipmentService.getEquipmentById(req.params.id);
  if (!existing) {
    throw AppError.notFound();
  }
  await equipmentService.deleteEquipment(req.params.id);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "resources.equipment.delete",
    entity: "Equipment",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(204).send();
}

export async function listMaintenanceHandler(req: Request, res: Response) {
  const equipment = await equipmentService.getEquipmentById(req.params.id);
  if (!equipment) {
    throw AppError.notFound();
  }
  res.json(await equipmentService.listMaintenance(req.params.id));
}

export async function addMaintenanceHandler(req: Request, res: Response) {
  const equipment = await equipmentService.getEquipmentById(req.params.id);
  if (!equipment) {
    throw AppError.notFound();
  }
  const record = await equipmentService.addMaintenance(req.params.id, req.body, req.user?.sub);
  await recordAuditLog({
    userId: req.user?.sub,
    action: "resources.equipment.maintenance",
    entity: "Equipment",
    entityId: req.params.id,
    ipAddress: req.ip,
  });
  res.status(201).json(record);
}
