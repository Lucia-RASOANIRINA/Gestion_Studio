import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../errors/AppError";

export interface AccessTokenPayload {
  sub: string;
  roles: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(AppError.unauthorized());
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
    next();
  } catch {
    next(AppError.unauthorized());
  }
}
