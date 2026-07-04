import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { validateBody, validateQuery } from "../../common/middleware/validate";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectHandler,
  listProjectsHandler,
  transitionProjectHandler,
  updateProjectHandler,
} from "./projects.controller";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  transitionProjectSchema,
  updateProjectSchema,
} from "./projects.validation";

export const projectsRouter = Router();

projectsRouter.use(authenticate);

projectsRouter.get(
  "/",
  requirePermission(PermissionModule.PROJECTS, PermissionAction.READ),
  validateQuery(listProjectsQuerySchema),
  asyncHandler(listProjectsHandler)
);
projectsRouter.get(
  "/:id",
  requirePermission(PermissionModule.PROJECTS, PermissionAction.READ),
  asyncHandler(getProjectHandler)
);
projectsRouter.post(
  "/",
  requirePermission(PermissionModule.PROJECTS, PermissionAction.CREATE),
  validateBody(createProjectSchema),
  asyncHandler(createProjectHandler)
);
projectsRouter.put(
  "/:id",
  requirePermission(PermissionModule.PROJECTS, PermissionAction.UPDATE),
  validateBody(updateProjectSchema),
  asyncHandler(updateProjectHandler)
);
projectsRouter.post(
  "/:id/transition",
  requirePermission(PermissionModule.PROJECTS, PermissionAction.UPDATE),
  validateBody(transitionProjectSchema),
  asyncHandler(transitionProjectHandler)
);
projectsRouter.delete(
  "/:id",
  requirePermission(PermissionModule.PROJECTS, PermissionAction.DELETE),
  asyncHandler(deleteProjectHandler)
);
