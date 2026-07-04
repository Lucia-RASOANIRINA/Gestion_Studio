import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { getSettingsHandler } from "./settings.controller";

export const settingsRouter = Router();

settingsRouter.use(authenticate);
settingsRouter.get(
  "/",
  requirePermission(PermissionModule.SETTINGS, PermissionAction.READ),
  getSettingsHandler
);
