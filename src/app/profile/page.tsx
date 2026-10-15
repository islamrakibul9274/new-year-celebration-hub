import type { Metadata } from "next";
import ProfileView from "./ProfileView";

export const metadata: Metadata = {
  title: "My Celebration Profile | New Year Celebration Hub",
  description: "Manage your celebration profile, VIP pass, orders and saved AI resolutions.",
  alternates: { canonical: "/profile" },
};

export default function Page() {
  return <ProfileView />;
}
