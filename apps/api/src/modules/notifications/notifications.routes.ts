import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate";
import { asyncHandler } from "../../common/middleware/asyncHandler";
import * as notificationsService from "./notifications.service";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

// Fil de notifications persistant (événements) + non-lues + alertes calculées.
notificationsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [feed, alerts] = await Promise.all([
      notificationsService.getFeed(),
      notificationsService.getAlerts(),
    ]);
    res.json({
      items: feed.items,
      unreadCount: feed.unreadCount,
      alerts: alerts.items,
      alertCount: alerts.count,
    });
  })
);

// Marquer une notification comme lue.
notificationsRouter.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    res.json(await notificationsService.markRead(req.params.id));
  })
);

// Marquer toutes les notifications comme lues.
notificationsRouter.post(
  "/read-all",
  asyncHandler(async (_req, res) => {
    res.json(await notificationsService.markAllRead());
  })
);
