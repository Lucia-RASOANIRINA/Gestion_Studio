import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { recordAuditLog } from "../../common/audit/recordAuditLog";
import * as settingsService from "./settings.service";

export async function getProfileHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const profile = await settingsService.getProfile(req.user.sub);
  res.json(profile);
}

export async function updateProfileHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  const profile = await settingsService.updateProfile(req.user.sub, req.body);
  await recordAuditLog({
    userId: req.user.sub,
    action: "settings.profile.update",
    entity: "User",
    entityId: req.user.sub,
    ipAddress: req.ip,
  });
  res.json(profile);
}
