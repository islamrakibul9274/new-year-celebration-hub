"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { triggerFireworksShower } from "@/components/effects/ConfettiTrigger";
import Link from "next/link";
import { 
  User, 
  Camera, 
  Crown, 
  Sparkles, 
  Save, 
  Ticket, 
  Target, 
  CheckCircle2,
  Loader2,
  ShoppingBag,
  BadgeCheck
} from "lucide-react";
import { getPlan, isPaidPlan } from "@/lib/plans";
import type { StoredOrder, StoredResolution } from "@/lib/store";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";

export default function ProfilePage() {
  const { user, loading, refreshUser, logout, sessionExpired } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [customGreeting, setCustomGreeting] = useState("");
  const [themePreference, setThemePreference] = useState("festive-crimson");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [myResolutions, setMyResolutions] = useState<StoredResolution[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "Ready to celebrate and achieve great milestones this year!");
      setCustomGreeting(user.customGreeting || "Happy New Year! Wishing you boundless joy and prosperity!");
      setThemePreference(user.themePreference || "festive-crimson");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  // Load order history + saved AI resolutions
  useEffect(() => {
    if (!user) return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => d.orders && setOrders(d.orders))
      .catch(() => {});
    fetch("/api/ai/mine")
      .then((r) => r.json())
      .then((d) => d.resolutions && setMyResolutions(d.resolutions))
      .catch(() => {});
  }, [user]);

  // Returning from Stripe Checkout: verify the payment and unlock the pass
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const upgraded = params.get("upgraded");
    const sessionId = params.get("session_id");
    if (!upgraded) return;

    // Only verify once per browser session to avoid repeat calls on refresh
    const alreadyChecked = sessionStorage.getItem("nye_upgrade_verified");
    if (alreadyChecked && alreadyChecked === sessionId) {
      router.replace("/profile");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/stripe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          await refreshUser();
          sessionStorage.setItem("nye_upgrade_verified", sessionId || "demo");
          triggerFireworksShower();
          toast(
            data.alreadyUpgraded
              ? "Your VIP pass is already active."
              : `Welcome to ${data.plan?.toUpperCase()} VIP! Your member benefits are unlocked.`,
            "success",
          );
        } else {
          toast(data.error || "We couldn't confirm your upgrade yet. It will unlock once payment clears.", "info");
        }
      } catch {
        toast("Network issue while confirming your upgrade. Please refresh in a moment.", "info");
      } finally {
        router.replace("/profile");
      }
    };
    verify();
  }, [user, refreshUser, toast, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file (PNG, JPG, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image is too large. Please choose a file under 5 MB.");
      return;
    }

    setUploadError("");
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64data }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) {
          setAvatar(data.url);
          await refreshUser();
          triggerFestiveConfetti(0.4);
        } else {
          setUploadError(data.error || "Upload failed. Please try again.");
        }
      } catch {
        setUploadError("Network error — image not uploaded.");
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.onerror = () => {
      setUploadError("Could not read that file. Please try another image.");
      setUploadingAvatar(false);
    };
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          customGreeting,
          themePreference,
          avatar,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        await refreshUser();
        triggerFestiveConfetti(0.3);
        toast("Profile saved", "success");
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || "Failed to save changes. Please try again.");
      }
    } catch {
      setSaveError("Network error — changes not saved.");
    } finally {
      setSaving(false);
    }
  };

  // Avoid hydration mismatch while waiting for client mounting/auth state
  if (!mounted || loading) {
    return (
      <div className="pt-48 pb-24 max-w-md mx-auto px-4 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
        <p className="text-xs text-ink-muted font-semibold tracking-wider uppercase">
          Loading Celebration Profile...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-40 pb-24 max-w-md mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-ink">Sign In to View Profile</h2>
        {sessionExpired && (
          <p className="text-sm text-gold" role="status">
            Your session expired. Please sign in again to continue.
          </p>
        )}
        <p className="text-sm text-ink-muted">
          Access your personal celebration dashboard, custom avatars, and booked gala passes.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login?redirect=/profile"
            className="px-6 py-3 rounded-full bg-primary text-ink font-bold text-xs shadow-lg shadow-primary/30 hover:bg-rose-600 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-full bg-white/[0.08] text-ink font-bold text-xs border border-hairline hover:bg-white/15 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="glass-card rounded-card p-8 border border-hairline-strong mb-10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with Upload button */}
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || "User")}`}
              alt={`${name}'s profile picture`}
              width={96}
              height={96}
              decoding="async"
              className="w-24 h-24 rounded-card object-cover border-2 border-gold/40 shadow-2xl bg-surface"
            />
            <label className="absolute inset-0 bg-black/60 rounded-card flex flex-col items-center justify-center text-ink text-[10px] font-bold opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition cursor-pointer">
              <Camera className="w-5 h-5 mb-1" />
              <span>{uploadingAvatar ? "Uploading..." : "Change"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                aria-label="Upload new avatar image"
                className="hidden"
              />
            </label>
            {uploadError && (
              <p role="alert" className="absolute -bottom-6 left-0 right-0 text-center text-[11px] font-semibold text-primary">
                {uploadError}
              </p>
            )}
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-ink flex items-center gap-2">
                {name}
                {isPaidPlan(user.plan) && (
                  <BadgeCheck className="w-5 h-5 text-gold" aria-label="Verified member" />
                )}
              </h1>
              <span className="bg-gradient-to-r from-primary to-gold text-ink text-[10px] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                {user.plan !== "free" && <Crown className="w-3 h-3" aria-hidden="true" />}
                {user.plan === "free" ? "Free Explorer" : `${getPlan(user.plan).name} Member`}
              </span>
            </div>
            <p className="text-xs text-ink-muted">{user.email}</p>
            <p className="text-xs text-gold/90 font-medium italic pt-1">{customGreeting}</p>
          </div>

          <div className="flex sm:flex-col gap-2">
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl bg-gold/20 text-gold border border-amber-500/30 text-xs font-bold hover:bg-gold/30 transition text-center"
            >
              Upgrade Pass
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Form & Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSaveProfile} className="glass-card rounded-card p-6 sm:p-8 border border-hairline-strong space-y-5">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <span>Celebration Preferences & Profile</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-ink-secondary block mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-hairline text-ink placeholder:text-ink-muted focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-secondary block mb-1">New Year Personal Motto / Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-hairline text-ink placeholder:text-ink-muted focus:border-primary text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-secondary block mb-1">Custom Celebration Greeting</label>
              <input
                type="text"
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-hairline text-ink placeholder:text-ink-muted focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-secondary block mb-1">Celebration Theme Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "festive-crimson", label: "Crimson Spark", color: "bg-primary" },
                  { id: "golden-gala", label: "Golden Gala", color: "bg-gold" },
                  { id: "midnight-neon", label: "Midnight Neon", color: "bg-violet-500" },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setThemePreference(t.id)}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition ${
                      themePreference === t.id
                        ? "border-amber-400 bg-white/[0.1] text-ink"
                        : "border-hairline bg-white/[0.03] text-ink-muted"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${t.color}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-gold text-ink font-bold text-sm shadow-xl shadow-primary/30 hover:opacity-95 transition flex items-center justify-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Profile Customization"}</span>
            </button>

            {savedSuccess && (
              <div className="text-center text-xs font-bold text-success flex items-center justify-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}
            {saveError && (
              <div role="alert" className="text-center text-xs font-semibold text-primary pt-1">
                {saveError}
              </div>
            )}
          </form>
        </div>

        {/* Right Passes & Resolutions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Ticket Card */}
          <div className="glass-card rounded-card p-6 border border-hairline-strong space-y-4">
            <h4 className="text-sm font-bold text-ink flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              <span>My Party Pass</span>
            </h4>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-surface to-gold/10 border border-gold/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-ink-muted">Venue</span>
                <span className="font-bold text-ink">New Park Hotel, FL</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-ink-muted">Date</span>
                <span className="font-bold text-ink">31 Dec (7:30 PM - Late)</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-hairline pt-2">
                <span className="text-ink-muted">Access Tier</span>
                <span className="font-bold font-mono text-gold uppercase">{user.plan} PASS</span>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="glass-card rounded-card p-6 border border-hairline-strong space-y-3">
            <h4 className="text-sm font-bold text-ink flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-success" />
              <span>Order History</span>
            </h4>
            {orders.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-ink-muted">
                  <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-xs text-ink-muted">No orders yet — explore the holiday deals.</p>
                <Link
                  href="/deals"
                  className="inline-block text-xs font-bold text-primary hover:underline"
                >
                  Browse deals →
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {orders.map((order) => (
                  <li
                    key={order._id || order.orderNumber}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-hairline"
                  >
                    <div>
                      <p className="text-xs font-bold text-ink font-mono">{order.orderNumber}</p>
                      <p className="text-[10px] text-ink-muted">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"} · {order.items?.length || 0} item(s)
                      </p>
                    </div>
                    <span className="text-sm font-black text-gold font-mono">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Saved AI Resolutions */}
          <div className="glass-card rounded-card p-6 border border-hairline-strong space-y-3">
            <h4 className="text-sm font-bold text-ink flex items-center gap-2">
              <Target className="w-4 h-4 text-gold" />
              <span>My AI Resolutions</span>
            </h4>
            {myResolutions.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-ink-muted">
                  <Target className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-xs text-ink-muted">No resolutions yet — let AI architect your year.</p>
                <Link
                  href="/ai-resolutions"
                  className="inline-block text-xs font-bold text-primary hover:underline"
                >
                  Create a resolution →
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {myResolutions.map((res) => (
                  <li key={res._id} className="p-3 rounded-xl bg-white/[0.04] border border-hairline space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-xs font-bold text-ink truncate">{res.goal}</h5>
                      <span className="badge badge-gold shrink-0">{res.category}</span>
                    </div>
                    {res.motivationalQuote && (
                      <p className="text-[11px] text-primary italic line-clamp-2">“{res.motivationalQuote}”</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Links */}
          <div className="glass-card rounded-card p-6 border border-hairline-strong space-y-3">
            <h4 className="text-sm font-bold text-ink flex items-center gap-2">
              <Target className="w-4 h-4 text-gold" />
              <span>Celebration Quick Tools</span>
            </h4>
            <div className="space-y-2 text-xs font-semibold">
              <Link
                href="/ai-resolutions"
                className="block p-3 rounded-xl bg-white/[0.04] hover:bg-white/10 text-ink transition"
              >
                🎯 Generate New AI Resolution Plan
              </Link>
              <Link
                href="/live-lounge"
                className="block p-3 rounded-xl bg-white/[0.04] hover:bg-white/10 text-ink transition"
              >
                📻 Join Real-Time Party Lounge
              </Link>
              <Link
                href="/deals"
                className="block p-3 rounded-xl bg-white/[0.04] hover:bg-white/10 text-ink transition"
              >
                🎁 Browse 65% OFF Holiday Deals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
