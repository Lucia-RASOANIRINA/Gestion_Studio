import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: req.t("errors.not_found") });
}

/** Traduit les erreurs Prisma connues en réponses HTTP propres plutôt que de laisser fuiter les détails SQL. */
function toAppError(err: Prisma.PrismaClientKnownRequestError): AppError {
  switch (err.code) {
    case "P2002": {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : String(err.meta?.target ?? "");
      return AppError.conflict("errors.duplicate_entry", { fields: target });
    }
    case "P2025":
      return AppError.notFound();
    case "P2003":
      return AppError.badRequest("errors.referenced_record_missing");
    default:
      return new AppError(500, "errors.internal_error");
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    appError = toAppError(err);
  } else if (err instanceof ZodError) {
    appError = AppError.badRequest("errors.validation_failed", err.flatten());
  } else {
    console.error(err);
    appError = new AppError(500, "errors.internal_error");
  }

  if (appError.statusCode >= 500) {
    console.error(err);
  }

  res.status(appError.statusCode).json({
    message: req.t(appError.messageKey),
    details: appError.details,
  });
}
