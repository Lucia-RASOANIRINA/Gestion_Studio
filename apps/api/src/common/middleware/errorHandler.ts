import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: req.t("errors.not_found") });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: req.t(err.messageKey),
      details: err.details,
    });
    return;
  }

  console.error(err);
  res.status(500).json({ message: req.t("errors.internal_error") });
}
