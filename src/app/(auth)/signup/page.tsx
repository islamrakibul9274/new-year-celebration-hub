import React from "react";
import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Join the Celebration | New Year Celebration Hub",
  description: "Create your free account to reserve VIP midnight passes, generate AI resolutions, and join the live lounge.",
};

export default function SignupPage() {
  return (
    <React.Suspense fallback={<div className="pt-48 pb-24 text-center text-sm text-gray-400">Loading…</div>}>
      <SignupForm />
    </React.Suspense>
  );
}
