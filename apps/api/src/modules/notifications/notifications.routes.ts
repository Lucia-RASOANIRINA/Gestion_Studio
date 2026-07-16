import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import * as notificationsService from "./notifications.service";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

// Alertes calculées, accessibles à tout utilisateur authentifié.
notificationsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await notificationsService.getNotifications());
  })
);
