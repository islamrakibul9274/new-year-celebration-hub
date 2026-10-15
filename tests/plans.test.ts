import { describe, expect, it } from "vitest";
import { PLANS, getPlan, isPaidPlan, planAllowsPassType, bestPassTier } from "@/lib/plans";

describe("plans", () => {
  it("falls back to the free plan for unknown values", () => {
    expect(getPlan("nope").id).toBe("free");
    expect(getPlan(undefined).id).toBe("free");
    expect(getPlan(null).id).toBe("free");
  });

  it("knows the three plans", () => {
    expect(Object.keys(PLANS)).toEqual(["free", "silver", "diamond"]);
  });

  it("gates AI generation by plan", () => {
    expect(PLANS.free.aiGenerationsPerDay).toBe(3);
    expect(PLANS.silver.aiGenerationsPerDay).toBe(Infinity);
    expect(PLANS.diamond.aiGenerationsPerDay).toBe(Infinity);
  });

  it("gates RSVP pass tiers by plan", () => {
    expect(planAllowsPassType("free", "standard")).toBe(true);
    expect(planAllowsPassType("free", "vip_silver")).toBe(false);
    expect(planAllowsPassType("silver", "vip_silver")).toBe(true);
    expect(planAllowsPassType("silver", "diamond_all_access")).toBe(false);
    expect(planAllowsPassType("diamond", "diamond_all_access")).toBe(true);
  });

  it("reports the best tier each plan unlocks", () => {
    expect(bestPassTier("free")).toBe("standard");
    expect(bestPassTier("silver")).toBe("vip_silver");
    expect(bestPassTier("diamond")).toBe("diamond_all_access");
    expect(bestPassTier("unknown")).toBe("standard");
  });

  it("flags paid plans", () => {
    expect(isPaidPlan("free")).toBe(false);
    expect(isPaidPlan("silver")).toBe(true);
    expect(isPaidPlan("diamond")).toBe(true);
  });

  it("gives paid members a verified badge and perks", () => {
    expect(PLANS.free.verifiedBadge).toBe(false);
    expect(PLANS.silver.verifiedBadge).toBe(true);
    expect(PLANS.diamond.verifiedBadge).toBe(true);
    expect(PLANS.silver.perks.length).toBeGreaterThan(3);
    expect(PLANS.silver.perks.join(" ")).toContain("Unlimited AI");
  });
});
