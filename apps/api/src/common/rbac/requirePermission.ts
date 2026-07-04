import type { NextFunction, Request, Response } from "express";
import type { PermissionAction, PermissionModule } from "@prisma/client";
import { AppError } from "../errors/AppError";
import { hasPermission } from "./hasPermission";

/**
 * Vérifie la permission en interrogeant la matrice rôle x permission en base
 * (jamais de rôles/permissions codés en dur), pour rester administrable
 * par l'administrateur sans redéploiement.
 */
export function requirePermission(module: PermissionModule, action: PermissionAction) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    const allowed = await hasPermission(req.user.sub, module, action);
    if (!allowed) {
      return next(AppError.forbidden());
    }

    next();
  };
}
