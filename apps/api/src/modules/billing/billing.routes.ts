import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { listInvoicesHandler } from "./billing.controller";

export const billingRouter = Router();

billingRouter.use(authenticate);
billingRouter.get(
  "/",
  requirePermission(PermissionModule.BILLING, PermissionAction.READ),
  listInvoicesHandler
);
