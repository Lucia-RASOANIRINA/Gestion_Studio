import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { listClientsHandler } from "./clients.controller";

export const clientsRouter = Router();

clientsRouter.use(authenticate);
clientsRouter.get(
  "/",
  requirePermission(PermissionModule.CLIENTS, PermissionAction.READ),
  listClientsHandler
);
