import type { Metadata } from "next";
import AIResolutionsView from "./AIResolutionsView";

export const metadata: Metadata = {
  title: "AI Resolution Coach & Greeting Studio | New Year Celebration Hub",
  description: "Turn your goals into quarterly milestone plans with AI, or generate festive greeting cards.",
  alternates: { canonical: "/ai-resolutions" },
};

export default function Page() {
  return <AIResolutionsView />;
}
