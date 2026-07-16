import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import * as authService from "./auth.service";

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.login(req.body, req.ip);
  if ("twoFactorRequired" in result) {
    res.json({ twoFactorRequired: true });
    return;
  }
  res.json({ message: req.t("auth.login_success"), ...result });
}

export async function refreshHandler(req: Request, res: Response) {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.json(tokens);
}

export async function logoutHandler(req: Request, res: Response) {
  await authService.logout(req.body.refreshToken);
  res.json({ message: req.t("auth.logout_success") });
}

export async function setup2faHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  res.json(await authService.setupTwoFactor(req.user.sub));
}

export async function enable2faHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  await authService.enableTwoFactor(req.user.sub, req.body.code);
  res.json({ twoFactorEnabled: true });
}

export async function disable2faHandler(req: Request, res: Response) {
  if (!req.user) throw AppError.unauthorized();
  await authService.disableTwoFactor(req.user.sub, req.body.code);
  res.json({ twoFactorEnabled: false });
}
