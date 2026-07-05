export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly messageKey: string,
    public readonly details?: unknown
  ) {
    super(messageKey);
    this.name = "AppError";
  }

  static notFound(messageKey = "errors.not_found") {
    return new AppError(404, messageKey);
  }

  static unauthorized(messageKey = "errors.unauthorized") {
    return new AppError(401, messageKey);
  }

  static forbidden(messageKey = "errors.forbidden") {
    return new AppError(403, messageKey);
  }

  static badRequest(messageKey = "errors.validation_failed", details?: unknown) {
    return new AppError(400, messageKey, details);
  }

  static conflict(messageKey = "errors.conflict", details?: unknown) {
    return new AppError(409, messageKey, details);
  }
}
