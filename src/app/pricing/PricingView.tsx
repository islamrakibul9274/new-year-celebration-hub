"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  CreditCard,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { triggerFestiveConfetti, triggerFireworksShower } from "@/components/effects/ConfettiTrigger";
import { getPlan } from "@/lib/plans";
import { useToast } from "@/components/ui/Toast";

export default function PricingPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 6000);
  };

  const activateDemoPlan = async (planId: string) => {
    try {
      const res = await fetch("/api/user/upgrade-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await refreshUser();
        setUpgradeSuccess(
          `🎉 You are now officially a ${planId.toUpperCase()} VIP Member! Verified badge, unlimited AI, and VIP pass tiers unlocked.`,
        );
        triggerFireworksShower();
        toast(
          data.alreadyActive
            ? `You already have the ${getPlan(planId).name} pass.`
            : `${getPlan(planId).name} activated — verified badge + unlimited AI + VIP RSVP tiers.`,
          "success",
        );
        setTimeout(() => setUpgradeSuccess(null), 6000);
      } else {
        showError(data.error || "Upgrade failed. Please try again.");
      }
    } catch {
      showError("Network error. Please try again.");
    }
  };

  const handleCheckout = async (planId: string, directActivate = false) => {
    setError(null);
    if (planId === "free") {
      if (!user) {
        router.push("/signup?redirect=/pricing");
      } else if (user.plan === "free") {
        showError("You are already on the Free Explorer plan.");
      } else {
        showError("You're on a paid pass — downgrade isn't needed to enjoy everything.");
      }
      return;
    }

    if (!user) {
      router.push(`/signup?redirect=/pricing&plan=${planId}`);
      return;
    }

    setLoadingPlan(planId);
    try {
      if (directActivate) {
        await activateDemoPlan(planId);
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Stripe checkout unavailable in this environment → offer instant demo activation
        showError("Stripe checkout is unavailable right now — activating your demo pass instead.");
        await activateDemoPlan(planId);
      }
    } catch {
      showError("Network error — activating your demo pass instead.");
      await activateDemoPlan(planId);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-amber-500/30 text-gold text-xs font-bold uppercase tracking-wider">
          <Crown className="w-4 h-4" />
          <span>VIP Celebration Passes</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-ink">
          Choose Your <br />
          <span className="festive-gradient-text">New Year Experience</span>
        </h1>
        <p className="text-ink-secondary text-base sm:text-lg">
          Unlock full VIP ballroom & rooftop gala access, unlimited AI resolution coaching, priority deals, and real-time live lounge perks.
        </p>

        {/* Upgrade Success Notification */}
        {upgradeSuccess && (
          <div className="p-4 rounded-2xl bg-success/15 border border-emerald-500/40 text-success text-sm font-bold flex items-center justify-center gap-2 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span>{upgradeSuccess}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-primary/15 border border-rose-500/40 text-primary text-sm font-semibold flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Monthly vs Annual Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className={`text-xs sm:text-sm font-bold ${interval === "month" ? "text-ink" : "text-ink-muted"}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => {
              setInterval(interval === "month" ? "year" : "month");
              triggerFestiveConfetti(0.3);
            }}
            className="w-14 h-8 rounded-full bg-white/[0.1] border border-hairline-strong p-1 flex items-center transition relative"
            aria-label="Toggle Billing Interval"
          >
            <div
              className={`w-6 h-6 rounded-full bg-gradient-to-r from-primary to-gold shadow-md transition-transform duration-300 ${
                interval === "year" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${interval === "year" ? "text-gold" : "text-ink-muted"}`}>
            Annual Billing
            <span className="bg-primary text-ink text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
              Save 25%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
        {/* Tier 1: Free Explorer */}
        <div className="glass-card rounded-card p-8 border border-hairline flex flex-col justify-between space-y-8 hover:border-white/25 transition">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-ink">Free Explorer</h3>
              <span className="text-[10px] uppercase tracking-wider text-ink-muted bg-white/[0.06] px-2.5 py-1 rounded-full font-bold">
                Standard
              </span>
            </div>
            <p className="text-xs text-ink-muted">Basic access to public celebration pages and standard RSVP.</p>
            <div className="text-4xl font-black text-ink font-mono">$0</div>

            <ul className="space-y-3 pt-4 border-t border-hairline text-xs text-ink-secondary">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-success shrink-0" />
                <span>Access to Midnight Party Public Area</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-success shrink-0" />
                <span>3 Free AI Resolution Generations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-success shrink-0" />
                <span>Live Countdown Lounge View</span>
              </li>
              <li className="flex items-center gap-2.5 text-ink-muted">
                <span className="line-through">VIP Rooftop Fireworks Access</span>
              </li>
              <li className="flex items-center gap-2.5 text-ink-muted">
                <span className="line-through">Exclusive 65% VIP Discount Bundles</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout("free")}
            className="w-full py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/15 text-ink font-bold text-xs transition"
          >
            {user?.plan === "free" ? "Current Active Plan" : "Get Started Free"}
          </button>
        </div>

        {/* Tier 2: Silver Celebration (Popular) */}
        <div className="glass-card rounded-card p-8 border-2 border-rose-500 relative flex flex-col justify-between space-y-8 shadow-2xl shadow-primary/20">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-gold text-ink text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-lg">
            Most Popular
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-ink">Silver Celebration</h3>
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <p className="text-xs text-ink-secondary">Complete VIP party experience with unlimited AI coaching.</p>
            <div className="flex items-baseline gap-1 text-ink font-mono">
              <span className="text-5xl font-black">
                {interval === "year" ? "$79" : "$9"}
              </span>
              <span className="text-xs text-ink-muted">/{interval === "year" ? "yr" : "mo"}</span>
            </div>

            <ul className="space-y-3 pt-4 border-t border-hairline text-xs text-ink">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span><strong>VIP Ballroom Access</strong> + Welcome Drinks</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Unlimited Groq AI Resolutions & Cards</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Live Lounge VIP Chat Badge & Fast Send</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>15% Extra Coupon across all holiday deals</span>
              </li>
              <li className="flex items-center gap-2.5 text-ink-muted">
                <span className="line-through">Private Rooftop Skybox Lounge</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleCheckout("silver")}
              disabled={loadingPlan === "silver" || authLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary via-rose-600 to-gold text-ink font-bold text-xs shadow-xl shadow-primary/30 hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {authLoading
                  ? "Checking your account..."
                  : loadingPlan === "silver"
                    ? "Connecting Stripe..."
                    : user?.plan === "silver"
                      ? "Active Silver Member"
                      : "Pay with Stripe ($" + (interval === "year" ? "79" : "9") + ")"}
              </span>
            </button>

            <button
              onClick={() => handleCheckout("silver", true)}
              disabled={loadingPlan === "silver" || authLoading}
              className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-gold font-bold text-[11px] border border-amber-400/30 transition flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-gold" />
              <span>Instant 1-Click Activate (VIP Demo)</span>
            </button>
          </div>
        </div>

        {/* Tier 3: Diamond Gala All-Access */}
        <div className="glass-card rounded-card p-8 border border-amber-400/40 flex flex-col justify-between space-y-8 hover:border-amber-400 transition bg-gradient-to-b from-amber-500/[0.05] to-transparent">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gold">Diamond Gala</h3>
              <Crown className="w-5 h-5 text-gold" />
            </div>
            <p className="text-xs text-ink-secondary">Ultimate all-inclusive luxury gala experience with skybox access.</p>
            <div className="flex items-baseline gap-1 text-ink font-mono">
              <span className="text-5xl font-black">
                {interval === "year" ? "$149" : "$19"}
              </span>
              <span className="text-xs text-ink-muted">/{interval === "year" ? "yr" : "mo"}</span>
            </div>

            <ul className="space-y-3 pt-4 border-t border-hairline text-xs text-ink">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <span><strong>All-Inclusive Rooftop Skybox</strong> & Champagne Bar</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <span>Dedicated Table & Gourmet 5-Course Dinner</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <span>Exclusive Diamond Hamper mailed to your home</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <span>Synchronized Screen-Wide Confetti Trigger Rights</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <span>Personalized AI Life Coach Mentorship</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleCheckout("diamond")}
              disabled={loadingPlan === "diamond" || authLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gold to-amber-600 text-black font-extrabold text-xs shadow-xl shadow-amber-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {authLoading
                  ? "Checking your account..."
                  : loadingPlan === "diamond"
                    ? "Connecting Stripe..."
                    : user?.plan === "diamond"
                      ? "Active Diamond Member"
                      : "Pay with Stripe ($" + (interval === "year" ? "149" : "19") + ")"}
              </span>
            </button>

            <button
              onClick={() => handleCheckout("diamond", true)}
              disabled={loadingPlan === "diamond" || authLoading}
              className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-gold font-bold text-[11px] border border-amber-400/30 transition flex items-center justify-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-gold" />
              <span>Instant 1-Click Activate (Diamond VIP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="glass-card rounded-card p-8 sm:p-12 border border-hairline space-y-6 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-ink text-center flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span>Frequently Asked Questions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs sm:text-sm">
          <div className="space-y-2">
            <h4 className="font-bold text-ink">Can I change or cancel my pass at any time?</h4>
            <p className="text-ink-muted leading-relaxed">Yes! You can manage or cancel your subscription anytime directly from your profile dashboard.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-ink">How do I receive my physical gala pass?</h4>
            <p className="text-ink-muted leading-relaxed">Your digital barcode pass is generated instantly in your profile and emailed via Resend upon checkout confirmation.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-ink">What payment methods are supported?</h4>
            <p className="text-ink-muted leading-relaxed">We support all major credit cards, Apple Pay, and Google Pay through Stripe secure checkout.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-ink">Are party tickets refundable?</h4>
            <p className="text-ink-muted leading-relaxed">Passes can be transferred or cancelled with a full refund up to 48 hours before December 31st.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
