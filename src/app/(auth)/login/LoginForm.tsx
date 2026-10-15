"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import AuthLayout from "@/components/auth/AuthLayout";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Card";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";
import { isValidEmail } from "@/lib/validators";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirectTo = searchParams.get("redirect") || "/profile";
  const safeRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        login(data.user);
        triggerFestiveConfetti(0.4);
        router.push(safeRedirect);
        router.refresh();
      } else {
        setError(data.error || "Unable to sign in. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your New Year celebration dashboard"
      footer={
        <p className="text-xs text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-rose-400 font-bold hover:underline">
            Join Celebration
          </Link>
        </p>
      }
    >
      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Email Address" htmlFor="login-email">
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <Input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="pl-10"
            />
          </div>
        </Field>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="label mb-0">
              Password
            </label>
            <Link href="/forgot-password" className="text-[11px] font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-ink-secondary select-none cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-primary"
          />
          Keep me signed in for 30 days
        </label>

        <Button type="submit" loading={loading} fullWidth className="mt-2">
          <span>Sign In to Celebration</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </form>
    </AuthLayout>
  );
}
