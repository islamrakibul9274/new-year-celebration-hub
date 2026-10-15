export type PlanId = "free" | "silver" | "diamond";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  /** Daily AI generations allowed (Infinity = unlimited) */
  aiGenerationsPerDay: number;
  /** RSVP pass tiers this plan is entitled to */
  passTiers: ("standard" | "vip_silver" | "diamond_all_access")[];
  /** Shows a verified badge next to the member's name */
  verifiedBadge: boolean;
  perks: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free Explorer",
    aiGenerationsPerDay: 3,
    passTiers: ["standard"],
    verifiedBadge: false,
    perks: [
      "Access to Midnight Party public area",
      "3 AI resolution generations per day",
      "Live countdown lounge view",
    ],
  },
  silver: {
    id: "silver",
    name: "Silver Celebration",
    aiGenerationsPerDay: Infinity,
    passTiers: ["standard", "vip_silver"],
    verifiedBadge: true,
    perks: [
      "VIP Ballroom access + welcome drinks",
      "Unlimited AI resolutions & greeting cards",
      "Verified member badge across the platform",
      "VIP Silver RSVP pass tier",
      "15% extra coupon on holiday deals",
      "Live lounge VIP chat badge",
    ],
  },
  diamond: {
    id: "diamond",
    name: "Diamond Gala",
    aiGenerationsPerDay: Infinity,
    passTiers: ["standard", "vip_silver", "diamond_all_access"],
    verifiedBadge: true,
    perks: [
      "All-inclusive rooftop skybox & champagne bar",
      "Unlimited AI resolutions & greeting cards",
      "Verified member badge across the platform",
      "Diamond all-access RSVP pass tier",
      "Synchronized screen-wide confetti triggers",
      "Personalized AI life coach mentorship",
    ],
  },
};

export function getPlan(planId: string | undefined | null): PlanDefinition {
  if (planId && planId in PLANS) return PLANS[planId as PlanId];
  return PLANS.free;
}

export function isPaidPlan(planId: string | undefined | null): boolean {
  return getPlan(planId).id !== "free";
}

export function planAllowsPassType(planId: string | undefined | null, passType: string): boolean {
  return getPlan(planId).passTiers.includes(passType as PlanDefinition["passTiers"][number]);
}

/** The highest RSVP tier a plan is entitled to. */
export function bestPassTier(planId: string | undefined | null) {
  const tiers = getPlan(planId).passTiers;
  return tiers[tiers.length - 1];
}
