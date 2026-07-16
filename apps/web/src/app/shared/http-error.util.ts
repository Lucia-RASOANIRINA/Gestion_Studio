import { HttpErrorResponse } from "@angular/common/http";

/**
 * Traduit une erreur HTTP en clé i18n générique. `overrides` permet à un
 * formulaire de fournir un message plus spécifique pour un statut donné
 * (ex. un conflit de planning) sans dupliquer la logique de statut.
 */
export function resolveErrorMessageKey(
  error: unknown,
  overrides: Partial<Record<number | "network", string>> = {}
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return "common.errors.unknown";
  }

  if (error.status === 0) {
    return overrides.network ?? "common.errors.network";
  }
  if (overrides[error.status]) {
    return overrides[error.status]!;
  }
  switch (error.status) {
    case 400:
      return "common.errors.validation";
    case 401:
      return "common.errors.unauthorized";
    case 403:
      return "common.errors.forbidden";
    case 404:
      return "common.errors.not_found";
    case 409:
      return "common.errors.conflict";
    default:
      return "common.errors.server";
  }
}
