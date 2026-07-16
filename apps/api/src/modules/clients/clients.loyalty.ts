export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

/** 1 point de fidélité pour 10 000 Ar payés. */
export const POINTS_PER_ARIARY = 1 / 10000;

const TIER_THRESHOLDS: { tier: LoyaltyTier; min: number }[] = [
  { tier: "PLATINUM", min: 2000 },
  { tier: "GOLD", min: 500 },
  { tier: "SILVER", min: 100 },
  { tier: "BRONZE", min: 0 },
];

/** Niveau de fidélité dérivé des points cumulés (jamais stocké). */
export function tierForPoints(points: number): LoyaltyTier {
  return (TIER_THRESHOLDS.find((t) => points >= t.min) ?? TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1]).tier;
}

/** Points gagnés pour un montant payé (arrondi à l'entier inférieur). */
export function pointsForPayment(amount: number): number {
  return Math.floor(amount * POINTS_PER_ARIARY);
}

/** Ajoute le niveau de fidélité calculé à un client. */
export function withTier<T extends { loyaltyPoints: number }>(client: T): T & { tier: LoyaltyTier } {
  return { ...client, tier: tierForPoints(client.loyaltyPoints) };
}
