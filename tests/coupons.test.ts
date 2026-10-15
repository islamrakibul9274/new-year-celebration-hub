import { describe, expect, it } from "vitest";
import { COUPONS, couponRate, findCoupon } from "@/lib/coupons";

describe("coupons", () => {
  it("finds codes case-insensitively and trims whitespace", () => {
    expect(findCoupon("festive15")?.code).toBe("FESTIVE15");
    expect(findCoupon("  HOLIDAY50  ")?.code).toBe("HOLIDAY50");
  });

  it("returns null for unknown codes", () => {
    expect(findCoupon("NYE2024")).toBeNull();
    expect(findCoupon("")).toBeNull();
  });

  it("maps codes to discount rates", () => {
    expect(couponRate("FESTIVE15")).toBe(0.15);
    expect(couponRate("NYE2026")).toBe(0.15);
    expect(couponRate("HOLIDAY50")).toBe(0.5);
    expect(couponRate(null)).toBe(0);
    expect(couponRate("BOGUS")).toBe(0);
  });

  it("advertises exactly the codes the cart accepts", () => {
    expect(COUPONS.map((c) => c.code)).toEqual(["FESTIVE15", "NYE2026", "HOLIDAY50"]);
  });
});
