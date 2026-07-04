import type { Request, Response } from "express";
import * as authService from "./auth.service";

export async function loginHandler(req: Request, res: Response) {
  const tokens = await authService.login(req.body, req.ip);
  res.json({ message: req.t("auth.login_success"), ...tokens });
}

export async function refreshHandler(req: Request, res: Response) {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.json(tokens);
}

export async function logoutHandler(req: Request, res: Response) {
  await authService.logout(req.body.refreshToken);
  res.json({ message: req.t("auth.logout_success") });
}
