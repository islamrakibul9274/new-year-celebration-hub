import type { Metadata } from "next";
import ForgotPasswordView from "./ForgotPasswordView";

export const metadata: Metadata = {
  title: "Forgot Password | New Year Celebration Hub",
  description: "Request a password reset link for your New Year Celebration Hub account.",
  alternates: { canonical: "/forgot-password" },
};

export default function Page() {
  return <ForgotPasswordView />;
}
