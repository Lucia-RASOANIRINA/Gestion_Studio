import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { requirePermission } from "../../common/rbac/requirePermission";
import { validateBody, validateQuery } from "../../common/middleware/validate";
import {
  createStudioHandler,
  deleteStudioHandler,
  getStudioHandler,
  listStudiosHandler,
  updateStudioHandler,
} from "./studios.controller";
import { createStudioSchema, listStudiosQuerySchema, updateStudioSchema } from "./studios.validation";

export const studiosRouter = Router();

const read = requirePermission(PermissionModule.RESOURCES, PermissionAction.READ);
const create = requirePermission(PermissionModule.RESOURCES, PermissionAction.CREATE);
const update = requirePermission(PermissionModule.RESOURCES, PermissionAction.UPDATE);
const remove = requirePermission(PermissionModule.RESOURCES, PermissionAction.DELETE);

studiosRouter.use(authenticate);

studiosRouter.get("/", read, validateQuery(listStudiosQuerySchema), asyncHandler(listStudiosHandler));
studiosRouter.get("/:id", read, asyncHandler(getStudioHandler));
studiosRouter.post("/", create, validateBody(createStudioSchema), asyncHandler(createStudioHandler));
studiosRouter.put("/:id", update, validateBody(updateStudioSchema), asyncHandler(updateStudioHandler));
studiosRouter.delete("/:id", remove, asyncHandler(deleteStudioHandler));
