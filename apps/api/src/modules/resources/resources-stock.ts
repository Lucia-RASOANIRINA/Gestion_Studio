/** Un consommable est en stock bas dès que sa quantité descend au seuil configuré (ou en dessous). */
export function isLowStock(quantity: number, lowStockThreshold: number): boolean {
  return quantity <= lowStockThreshold;
}

/**
 * Calcule la nouvelle quantité après un ajustement de stock (positif ou
 * négatif), en refusant de descendre sous zéro (ex. retrait de plus de
 * matériel qu'il n'en reste).
 */
export function applyStockAdjustment(currentQuantity: number, delta: number): number {
  const next = currentQuantity + delta;
  if (next < 0) {
    throw new RangeError("Stock quantity cannot go below zero");
  }
  return next;
}
