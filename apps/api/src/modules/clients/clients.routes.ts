import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { validateBody, validateQuery } from "../../common/middleware/validate";
import {
  blacklistClientHandler,
  createClientHandler,
  deleteClientHandler,
  getClientHandler,
  listClientsHandler,
  updateClientHandler,
} from "./clients.controller";
import {
  blacklistClientSchema,
  createClientSchema,
  listClientsQuerySchema,
  updateClientSchema,
} from "./clients.validation";

export const clientsRouter = Router();

clientsRouter.use(authenticate);

clientsRouter.get(
  "/",
  requirePermission(PermissionModule.CLIENTS, PermissionAction.READ),
  validateQuery(listClientsQuerySchema),
  asyncHandler(listClientsHandler)
);
clientsRouter.get(
  "/:id",
  requirePermission(PermissionModule.CLIENTS, PermissionAction.READ),
  asyncHandler(getClientHandler)
);
clientsRouter.post(
  "/",
  requirePermission(PermissionModule.CLIENTS, PermissionAction.CREATE),
  validateBody(createClientSchema),
  asyncHandler(createClientHandler)
);
clientsRouter.put(
  "/:id",
  requirePermission(PermissionModule.CLIENTS, PermissionAction.UPDATE),
  validateBody(updateClientSchema),
  asyncHandler(updateClientHandler)
);
clientsRouter.patch(
  "/:id/blacklist",
  requirePermission(PermissionModule.CLIENTS, PermissionAction.UPDATE),
  validateBody(blacklistClientSchema),
  asyncHandler(blacklistClientHandler)
);
clientsRouter.delete(
  "/:id",
  requirePermission(PermissionModule.CLIENTS, PermissionAction.DELETE),
  asyncHandler(deleteClientHandler)
);
