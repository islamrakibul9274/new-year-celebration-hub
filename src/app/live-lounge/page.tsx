import type { Metadata } from "next";
import LiveLoungeView from "./LiveLoungeView";

export const metadata: Metadata = {
  title: "Live Party Lounge | New Year Celebration Hub",
  description: "Real-time celebration chat room with synchronized countdown and screen-wide confetti drops.",
  alternates: { canonical: "/live-lounge" },
};

export default function Page() {
  return <LiveLoungeView />;
}
