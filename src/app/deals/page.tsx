import type { Metadata } from "next";
import DealsView from "./DealsView";

export const metadata: Metadata = {
  title: "Holiday Deals & 65% OFF Gifts | New Year Celebration Hub",
  description: "Shop hand-curated New Year gift baskets, fireworks kits, party decor and festive essentials with up to 65% off.",
  alternates: { canonical: "/deals" },
};

export default function Page() {
  return <DealsView />;
}
