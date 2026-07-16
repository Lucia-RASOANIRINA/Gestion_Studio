import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { requirePermission } from "../../common/rbac/requirePermission";
import { validateBody, validateQuery } from "../../common/middleware/validate";
import {
  addPaymentHandler,
  createInvoiceHandler,
  deleteInvoiceHandler,
  getInvoiceHandler,
  getSummaryHandler,
  listInvoicesHandler,
  signInvoiceHandler,
  updateInvoiceHandler,
  updateInvoiceStatusHandler,
} from "./billing.controller";
import {
  addPaymentSchema,
  createInvoiceSchema,
  listInvoicesQuerySchema,
  signInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
} from "./billing.validation";

export const billingRouter = Router();

const read = requirePermission(PermissionModule.BILLING, PermissionAction.READ);
const create = requirePermission(PermissionModule.BILLING, PermissionAction.CREATE);
const update = requirePermission(PermissionModule.BILLING, PermissionAction.UPDATE);
const remove = requirePermission(PermissionModule.BILLING, PermissionAction.DELETE);

billingRouter.use(authenticate);

billingRouter.get("/summary", read, asyncHandler(getSummaryHandler));
billingRouter.get(
  "/",
  read,
  validateQuery(listInvoicesQuerySchema),
  asyncHandler(listInvoicesHandler)
);
billingRouter.get("/:id", read, asyncHandler(getInvoiceHandler));
billingRouter.post("/", create, validateBody(createInvoiceSchema), asyncHandler(createInvoiceHandler));
billingRouter.put("/:id", update, validateBody(updateInvoiceSchema), asyncHandler(updateInvoiceHandler));
billingRouter.patch(
  "/:id/status",
  update,
  validateBody(updateInvoiceStatusSchema),
  asyncHandler(updateInvoiceStatusHandler)
);
billingRouter.post(
  "/:id/payments",
  update,
  validateBody(addPaymentSchema),
  asyncHandler(addPaymentHandler)
);
billingRouter.post(
  "/:id/sign",
  update,
  validateBody(signInvoiceSchema),
  asyncHandler(signInvoiceHandler)
);
billingRouter.delete("/:id", remove, asyncHandler(deleteInvoiceHandler));
