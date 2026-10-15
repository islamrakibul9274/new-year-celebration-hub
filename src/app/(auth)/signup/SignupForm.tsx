"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Card";
import { ArrowRight, Lock, Mail, User as UserIcon } from "lucide-react";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";
import { checkPassword, isValidEmail, isValidName, PASSWORD_MIN_LENGTH } from "@/lib/validators";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirectParam = searchParams.get("redirect") || "/profile";
  const safeRedirect =
    redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : "/profile";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordCheck = checkPassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidName(name)) {
      setError("Please enter your name (2–60 characters).");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!passwordCheck.valid) {
      setError(`Password needs at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        login(data.user);
        triggerFestiveConfetti(0.5);
        router.push(safeRedirect);
        router.refresh();
      } else {
        setError(data.error || "Unable to create your account. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the ultimate New Year celebration hub"
      footer={
        <p className="text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-rose-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      }
    >
      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Your Full Name" htmlFor="signup-name">
          <div className="relative">
            <UserIcon className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <Input
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Morgan"
              className="pl-10"
            />
          </div>
        </Field>

        <Field label="Email Address" htmlFor="signup-email">
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
          <Field label="Password" htmlFor="signup-password">
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <Input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
          </Field>
          <div id="password-requirements" className="pt-2">
            <PasswordStrengthMeter password={password} />
          </div>
        </div>

        <Button type="submit" loading={loading} fullWidth className="mt-2">
          <span>Join Celebration</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      </form>
    </AuthLayout>
  );
}
