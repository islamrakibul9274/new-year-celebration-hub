import React from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In | New Year Celebration Hub",
  description: "Sign in to access your celebration profile, VIP passes, AI resolutions, and party reservations.",
};

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="pt-48 pb-24 text-center text-sm text-gray-400">Loading…</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
