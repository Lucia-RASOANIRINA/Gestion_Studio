import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { listProjectsHandler } from "./projects.controller";

export const projectsRouter = Router();

projectsRouter.use(authenticate);
projectsRouter.get(
  "/",
  requirePermission(PermissionModule.PROJECTS, PermissionAction.READ),
  listProjectsHandler
);
