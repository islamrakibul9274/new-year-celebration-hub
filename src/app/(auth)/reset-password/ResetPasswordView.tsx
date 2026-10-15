"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";
import { checkPassword, PASSWORD_MIN_LENGTH } from "@/lib/validators";

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="pt-48 pb-24 text-center text-sm text-gray-400">Loading…</div>}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(token ? "" : "This reset link is invalid or incomplete.");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordCheck = checkPassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid or incomplete.");
      return;
    }
    if (!passwordCheck.valid) {
      setError(`Password needs at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.error || "Unable to reset password. Please request a new link.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout
        title="Password Updated"
        subtitle="Taking you to sign in..."
        footer={
          <Link href="/login" className="text-xs text-rose-400 font-bold hover:underline">
            Sign in now →
          </Link>
        }
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-sm text-gray-300">
            Your password has been changed. All other sessions have been signed out.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a New Password"
      subtitle="Make it strong — you'll use it to sign in from now on"
      footer={
        <Link href="/login" className="text-xs text-rose-400 font-bold hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      {error && (
        <Alert tone="error">{error}</Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Field label="New Password" htmlFor="reset-password">
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <div className="pt-2">
            <PasswordStrengthMeter password={password} />
          </div>
        </div>

        <Field label="Confirm New Password" htmlFor="reset-confirm">
          <Input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" loading={loading} fullWidth>
          <span>Update Password</span>
        </Button>
      </form>
    </AuthLayout>
  );
}
