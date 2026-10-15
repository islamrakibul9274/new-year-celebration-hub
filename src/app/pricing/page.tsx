import type { Metadata } from "next";
import PricingView from "./PricingView";

export const metadata: Metadata = {
  title: "VIP Membership Passes | New Year Celebration Hub",
  description: "Compare Silver and Diamond New Year gala passes — verified member badge, unlimited AI resolutions, priority RSVP tiers.",
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PricingView />;
}
