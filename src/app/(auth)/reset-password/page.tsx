import type { Metadata } from "next";
import ResetPasswordView from "./ResetPasswordView";

export const metadata: Metadata = {
  title: "Choose a New Password | New Year Celebration Hub",
  description: "Set a new password for your New Year Celebration Hub account.",
  alternates: { canonical: "/reset-password" },
};

export default function Page() {
  return <ResetPasswordView />;
}
