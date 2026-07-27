import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { validateBody, validateQuery } from "../../common/middleware/validate";
import {
  createBookingHandler,
  deleteBookingHandler,
  getBookingHandler,
  getBookingIcsHandler,
  listBookingsHandler,
  listEngineersHandler,
  updateBookingHandler,
} from "./planning.controller";
import { createBookingSchema, listBookingsQuerySchema, updateBookingSchema } from "./planning.validation";

export const planningRouter = Router();

// Route ICS publique - pas d'authentification requise
planningRouter.get(
  "/:id/ics",
  asyncHandler(getBookingIcsHandler)
);

// Toutes les autres routes necessitent une authentification
planningRouter.use(authenticate);

planningRouter.get(
  "/",
  requirePermission(PermissionModule.PLANNING, PermissionAction.READ),
  validateQuery(listBookingsQuerySchema),
  asyncHandler(listBookingsHandler)
);

planningRouter.get(
  "/engineers",
  requirePermission(PermissionModule.PLANNING, PermissionAction.READ),
  asyncHandler(listEngineersHandler)
);

planningRouter.get(
  "/:id",
  requirePermission(PermissionModule.PLANNING, PermissionAction.READ),
  asyncHandler(getBookingHandler)
);

planningRouter.post(
  "/",
  requirePermission(PermissionModule.PLANNING, PermissionAction.CREATE),
  validateBody(createBookingSchema),
  asyncHandler(createBookingHandler)
);

planningRouter.put(
  "/:id",
  requirePermission(PermissionModule.PLANNING, PermissionAction.UPDATE),
  validateBody(updateBookingSchema),
  asyncHandler(updateBookingHandler)
);

planningRouter.delete(
  "/:id",
  requirePermission(PermissionModule.PLANNING, PermissionAction.DELETE),
  asyncHandler(deleteBookingHandler)
);