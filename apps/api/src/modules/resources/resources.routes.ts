import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { listResourcesHandler } from "./resources.controller";

export const resourcesRouter = Router();

resourcesRouter.use(authenticate);
resourcesRouter.get(
  "/",
  requirePermission(PermissionModule.RESOURCES, PermissionAction.READ),
  listResourcesHandler
);
