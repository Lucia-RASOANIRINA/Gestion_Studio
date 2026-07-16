import { applyStockAdjustment, isLowStock } from "./resources-stock";

describe("isLowStock", () => {
  it("flags quantity equal to the threshold as low stock", () => {
    expect(isLowStock(10, 10)).toBe(true);
  });

  it("flags quantity below the threshold as low stock", () => {
    expect(isLowStock(3, 10)).toBe(true);
  });

  it("does not flag quantity above the threshold", () => {
    expect(isLowStock(25, 10)).toBe(false);
  });
});

describe("applyStockAdjustment", () => {
  it("increases the quantity for a positive delta", () => {
    expect(applyStockAdjustment(10, 5)).toBe(15);
  });

  it("decreases the quantity for a negative delta", () => {
    expect(applyStockAdjustment(10, -4)).toBe(6);
  });

  it("allows reaching exactly zero", () => {
    expect(applyStockAdjustment(5, -5)).toBe(0);
  });

  it("rejects an adjustment that would go below zero", () => {
    expect(() => applyStockAdjustment(5, -6)).toThrow(RangeError);
  });
});
