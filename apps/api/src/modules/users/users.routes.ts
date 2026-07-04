import { Router } from "express";
import { PermissionAction, PermissionModule } from "@prisma/client";
import { authenticate } from "../../common/middleware/authenticate";
import { requirePermission } from "../../common/rbac/requirePermission";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import { getUserHandler, listUsersHandler } from "./users.controller";

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get(
  "/",
  requirePermission(PermissionModule.USERS, PermissionAction.READ),
  asyncHandler(listUsersHandler)
);
usersRouter.get(
  "/:id",
  requirePermission(PermissionModule.USERS, PermissionAction.READ),
  asyncHandler(getUserHandler)
);
