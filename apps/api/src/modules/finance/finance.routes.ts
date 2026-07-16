import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { requirePermission } from "../../common/rbac/requirePermission";
import { validateBody, validateQuery } from "../../common/middleware/validate";
import {
  createExpenseHandler,
  deleteExpenseHandler,
  getTreasuryHandler,
  listExpensesHandler,
  updateExpenseHandler,
} from "./finance.controller";
import {
  createExpenseSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
} from "./finance.validation";

export const financeRouter = Router();

// La gestion financière relève de la permission BILLING (Facturation & Finances).
const read = requirePermission(PermissionModule.BILLING, PermissionAction.READ);
const create = requirePermission(PermissionModule.BILLING, PermissionAction.CREATE);
const update = requirePermission(PermissionModule.BILLING, PermissionAction.UPDATE);
const remove = requirePermission(PermissionModule.BILLING, PermissionAction.DELETE);

financeRouter.use(authenticate);

financeRouter.get("/treasury", read, asyncHandler(getTreasuryHandler));
financeRouter.get(
  "/expenses",
  read,
  validateQuery(listExpensesQuerySchema),
  asyncHandler(listExpensesHandler)
);
financeRouter.post(
  "/expenses",
  create,
  validateBody(createExpenseSchema),
  asyncHandler(createExpenseHandler)
);
financeRouter.put(
  "/expenses/:id",
  update,
  validateBody(updateExpenseSchema),
  asyncHandler(updateExpenseHandler)
);
financeRouter.delete("/expenses/:id", remove, asyncHandler(deleteExpenseHandler));
