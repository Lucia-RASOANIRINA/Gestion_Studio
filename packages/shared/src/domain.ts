/** Types de service proposés par la maison de production (personnalisables via les paramètres). */
export enum ServiceType {
  RECORDING = "recording",
  MIXING = "mixing",
  MASTERING = "mastering",
  POST_PRODUCTION = "post_production",
  VOICE_OVER = "voice_over",
  EQUIPMENT_RENTAL = "equipment_rental",
  LIVE_EVENT = "live_event",
  OTHER = "other",
}

/** Statuts du workflow projet, avec transitions contrôlées par permission. */
export enum ProjectStatus {
  QUOTE = "quote",
  VALIDATED = "validated",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DELIVERED = "delivered",
  INVOICED = "invoiced",
  ARCHIVED = "archived",
}

/** Segments de clientèle. */
export enum ClientSegment {
  ARTIST = "artist",
  LABEL = "label",
  ADVERTISING_AGENCY = "advertising_agency",
  COMPANY = "company",
  INSTITUTION = "institution",
  OTHER = "other",
}

export enum Currency {
  MGA = "MGA",
  EUR = "EUR",
  USD = "USD",
}

export enum PaymentMethod {
  MVOLA = "mvola",
  ORANGE_MONEY = "orange_money",
  AIRTEL_MONEY = "airtel_money",
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
}

export const DEFAULT_TIMEZONE = "Indian/Antananarivo"; // UTC+3
export const DEFAULT_CURRENCY = Currency.MGA;
export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const PHONE_REGEX = /^\+261\d{9}$/;
