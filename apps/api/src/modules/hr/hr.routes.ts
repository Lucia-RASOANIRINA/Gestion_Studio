import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { requirePermission } from "../../common/rbac/requirePermission";
import { validateBody, validateQuery } from "../../common/middleware/validate";
import {
  addLeaveHandler,
  createEmployeeHandler,
  deleteEmployeeHandler,
  deleteLeaveHandler,
  getEmployeeHandler,
  listEmployeesHandler,
  updateEmployeeHandler,
  updateLeaveStatusHandler,
} from "./hr.controller";
import {
  createEmployeeSchema,
  createLeaveSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
  updateLeaveStatusSchema,
} from "./hr.validation";

export const hrRouter = Router();

// La gestion RH relève de la permission USERS (administration des personnes).
const read = requirePermission(PermissionModule.USERS, PermissionAction.READ);
const create = requirePermission(PermissionModule.USERS, PermissionAction.CREATE);
const update = requirePermission(PermissionModule.USERS, PermissionAction.UPDATE);
const remove = requirePermission(PermissionModule.USERS, PermissionAction.DELETE);

hrRouter.use(authenticate);

hrRouter.get("/employees", read, validateQuery(listEmployeesQuerySchema), asyncHandler(listEmployeesHandler));
hrRouter.get("/employees/:id", read, asyncHandler(getEmployeeHandler));
hrRouter.post("/employees", create, validateBody(createEmployeeSchema), asyncHandler(createEmployeeHandler));
hrRouter.put("/employees/:id", update, validateBody(updateEmployeeSchema), asyncHandler(updateEmployeeHandler));
hrRouter.delete("/employees/:id", remove, asyncHandler(deleteEmployeeHandler));

hrRouter.post(
  "/employees/:id/leaves",
  update,
  validateBody(createLeaveSchema),
  asyncHandler(addLeaveHandler)
);
hrRouter.patch(
  "/leaves/:leaveId/status",
  update,
  validateBody(updateLeaveStatusSchema),
  asyncHandler(updateLeaveStatusHandler)
);
hrRouter.delete("/leaves/:leaveId", remove, asyncHandler(deleteLeaveHandler));
