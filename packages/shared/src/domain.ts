/**
 * Ces enums reflètent exactement les valeurs des enums Prisma correspondants
 * (`apps/api/prisma/schema.prisma`) afin que le frontend puisse les utiliser
 * directement sans conversion de casse.
 */

/** Types de service proposés par la maison de production (personnalisables via les paramètres). */
export enum ServiceType {
  RECORDING = "RECORDING",
  MIXING = "MIXING",
  MASTERING = "MASTERING",
  POST_PRODUCTION = "POST_PRODUCTION",
  VOICE_OVER = "VOICE_OVER",
  EQUIPMENT_RENTAL = "EQUIPMENT_RENTAL",
  LIVE_EVENT = "LIVE_EVENT",
  OTHER = "OTHER",
}

/** Statuts du workflow projet, avec transitions contrôlées par permission. */
export enum ProjectStatus {
  QUOTE = "QUOTE",
  VALIDATED = "VALIDATED",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DELIVERED = "DELIVERED",
  INVOICED = "INVOICED",
  ARCHIVED = "ARCHIVED",
}

/** Segments de clientèle. */
export enum ClientSegment {
  ARTIST = "ARTIST",
  LABEL = "LABEL",
  ADVERTISING_AGENCY = "ADVERTISING_AGENCY",
  COMPANY = "COMPANY",
  INSTITUTION = "INSTITUTION",
  OTHER = "OTHER",
}

export enum Currency {
  MGA = "MGA",
  EUR = "EUR",
  USD = "USD",
}

export enum PaymentMethod {
  MVOLA = "MVOLA",
  ORANGE_MONEY = "ORANGE_MONEY",
  AIRTEL_MONEY = "AIRTEL_MONEY",
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export const DEFAULT_TIMEZONE = "Indian/Antananarivo"; // UTC+3
export const DEFAULT_CURRENCY = Currency.MGA;
export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const PHONE_REGEX = /^\+261\d{9}$/;
