"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Card";
import { Mail, MailCheck, Mail as MailIcon } from "lucide-react";
import { isValidEmail } from "@/lib/validators";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check Your Inbox"
        subtitle="If an account exists, a reset link is on its way"
        footer={
          <Link href="/login" className="text-xs text-rose-400 font-bold hover:underline">
            ← Back to sign in
          </Link>
        }
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
            <MailCheck className="w-7 h-7" />
          </div>
          <p className="text-sm text-gray-300">
            We sent a password reset link to <strong className="text-white">{email}</strong>. The link
            expires in 60 minutes.
          </p>
          <p className="text-xs text-gray-500">
            Didn&apos;t get it? Check your spam folder, or try again in a few minutes.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we'll send a reset link"
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
        <Field label="Email Address" htmlFor="forgot-email">
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
        <Button type="submit" loading={loading} fullWidth>
          <MailIcon className="w-4 h-4" aria-hidden="true" />
          <span>Send Reset Link</span>
        </Button>
      </form>
    </AuthLayout>
  );
}
