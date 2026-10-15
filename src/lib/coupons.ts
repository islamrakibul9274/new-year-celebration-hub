export interface Coupon {
  code: string;
  rate: number;
  label: string;
}

export const COUPONS: Coupon[] = [
  { code: "FESTIVE15", rate: 0.15, label: "15% festive extra off" },
  { code: "NYE2026", rate: 0.15, label: "15% New Year extra off" },
  { code: "HOLIDAY50", rate: 0.5, label: "50% holiday mega deal" },
];

export function findCoupon(input: string): Coupon | null {
  const clean = input.trim().toUpperCase();
  return COUPONS.find((c) => c.code === clean) || null;
}

export function couponRate(code: string | null): number {
  if (!code) return 0;
  return findCoupon(code)?.rate ?? 0;
}
