import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { validateBody, validateQuery } from "../../common/middleware/validate";
import {
  addMaintenanceHandler,
  createEquipmentHandler,
  deleteEquipmentHandler,
  getEquipmentHandler,
  listEquipmentHandler,
  listMaintenanceHandler,
  updateEquipmentHandler,
} from "./equipment.controller";
import {
  createEquipmentSchema,
  createMaintenanceSchema,
  listEquipmentQuerySchema,
  updateEquipmentSchema,
} from "./equipment.validation";
import {
  adjustConsumableHandler,
  createConsumableHandler,
  deleteConsumableHandler,
  getConsumableHandler,
  listConsumablesHandler,
  updateConsumableHandler,
} from "./consumable.controller";
import {
  adjustConsumableSchema,
  createConsumableSchema,
  listConsumablesQuerySchema,
  updateConsumableSchema,
} from "./consumable.validation";

export const resourcesRouter = Router();

resourcesRouter.use(authenticate);

const read = requirePermission(PermissionModule.RESOURCES, PermissionAction.READ);
const create = requirePermission(PermissionModule.RESOURCES, PermissionAction.CREATE);
const update = requirePermission(PermissionModule.RESOURCES, PermissionAction.UPDATE);
const remove = requirePermission(PermissionModule.RESOURCES, PermissionAction.DELETE);

resourcesRouter.get("/equipment", read, validateQuery(listEquipmentQuerySchema), asyncHandler(listEquipmentHandler));
resourcesRouter.get("/equipment/:id", read, asyncHandler(getEquipmentHandler));
resourcesRouter.post(
  "/equipment",
  create,
  validateBody(createEquipmentSchema),
  asyncHandler(createEquipmentHandler)
);
resourcesRouter.put(
  "/equipment/:id",
  update,
  validateBody(updateEquipmentSchema),
  asyncHandler(updateEquipmentHandler)
);
resourcesRouter.delete("/equipment/:id", remove, asyncHandler(deleteEquipmentHandler));

resourcesRouter.get("/equipment/:id/maintenance", read, asyncHandler(listMaintenanceHandler));
resourcesRouter.post(
  "/equipment/:id/maintenance",
  update,
  validateBody(createMaintenanceSchema),
  asyncHandler(addMaintenanceHandler)
);

resourcesRouter.get(
  "/consumables",
  read,
  validateQuery(listConsumablesQuerySchema),
  asyncHandler(listConsumablesHandler)
);
resourcesRouter.get("/consumables/:id", read, asyncHandler(getConsumableHandler));
resourcesRouter.post(
  "/consumables",
  create,
  validateBody(createConsumableSchema),
  asyncHandler(createConsumableHandler)
);
resourcesRouter.put(
  "/consumables/:id",
  update,
  validateBody(updateConsumableSchema),
  asyncHandler(updateConsumableHandler)
);
resourcesRouter.post(
  "/consumables/:id/adjust",
  update,
  validateBody(adjustConsumableSchema),
  asyncHandler(adjustConsumableHandler)
);
resourcesRouter.delete("/consumables/:id", remove, asyncHandler(deleteConsumableHandler));
