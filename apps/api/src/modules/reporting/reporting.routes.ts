import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { getDashboardHandler } from "./reporting.controller";

export const reportingRouter = Router();

reportingRouter.use(authenticate);
reportingRouter.get(
  "/dashboard",
  requirePermission(PermissionModule.REPORTING, PermissionAction.READ),
  getDashboardHandler
);
