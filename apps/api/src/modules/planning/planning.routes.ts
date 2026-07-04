import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { listPlanningHandler } from "./planning.controller";

export const planningRouter = Router();

planningRouter.use(authenticate);
planningRouter.get(
  "/",
  requirePermission(PermissionModule.PLANNING, PermissionAction.READ),
  listPlanningHandler
);
