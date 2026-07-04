import type { NextFunction, Request, Response } from "express";
import type { PermissionAction, PermissionModule } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../errors/AppError";

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

    const count = await prisma.rolePermission.count({
      where: {
        role: { users: { some: { userId: req.user.sub } } },
        permission: { module, action },
      },
    });

    if (count === 0) {
      return next(AppError.forbidden());
    }

    next();
  };
}
