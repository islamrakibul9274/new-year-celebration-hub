"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";
import {
  Sparkles,
  PartyPopper,
  Calendar,
  Gift,
  BrainCircuit,
  CreditCard,
  Radio,
  User as UserIcon,
  LogOut,
  LogIn,
  Menu,
  X,
  Crown,
  ChevronDown,
  ShoppingCart,
  BadgeCheck,
} from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { isPaidPlan } from "@/lib/plans";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Sparkles, short: "Home" },
  { name: "Events & RSVP", href: "/events", icon: Calendar, short: "Events" },
  { name: "Deals & Gifts", href: "/deals", icon: Gift, short: "Deals" },
  { name: "AI Studio", href: "/ai-resolutions", icon: BrainCircuit, short: "AI" },
  { name: "VIP Pricing", href: "/pricing", icon: CreditCard, short: "VIP" },
  { name: "Live Lounge", href: "/live-lounge", icon: Radio, short: "Live", badge: "LIVE" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEscapeKey(profileDropdownOpen, () => setProfileDropdownOpen(false));
  useEscapeKey(mobileMenuOpen, () => {
    setMobileMenuOpen(false);
    hamburgerRef.current?.focus();
  });

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [mobileMenuOpen]);

  // Dismiss the profile dropdown on outside click
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileDropdownOpen]);

  // Move focus into the mobile drawer when it opens
  useEffect(() => {
    if (mobileMenuOpen) {
      const first = mobileMenuRef.current?.querySelector<HTMLElement>("a, button");
      first?.focus();
    }
  }, [mobileMenuOpen]);

  const desktopLinkClass = (active: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-150 ${
      active
        ? "bg-gradient-to-r from-primary to-gold text-white shadow-md"
        : "text-ink-secondary hover:text-ink hover:bg-white/[0.08]"
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-canvas/95 backdrop-blur-xl border-b border-hairline shadow-2xl py-2.5"
          : "bg-gradient-to-b from-canvas/90 via-canvas/40 to-transparent py-3.5"
      }`}
    >
      <div className="gutter">
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group select-none py-1"
            onClick={() => triggerFestiveConfetti(0.2)}
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-rose-600 to-gold p-[1.5px] shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-transform duration-150 group-hover:scale-105 shrink-0">
              <div className="w-full h-full bg-[#0e111d] rounded-[14px] flex items-center justify-center">
                <PartyPopper className="w-5 h-5 text-gold" aria-hidden="true" />
              </div>
            </div>
            <div className="flex flex-col justify-center text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-sm tracking-tight text-ink uppercase whitespace-nowrap">
                  NEW YEAR
                </span>
                <span className="font-extrabold text-[11px] text-gold font-mono px-1.5 py-0.5 rounded-md bg-gold-soft border border-gold/30 leading-none">
                  2026
                </span>
              </div>
              <span className="text-[9px] tracking-[0.22em] uppercase font-bold text-primary mt-1 leading-none whitespace-nowrap">
                Celebration Hub
              </span>
            </div>
          </Link>

          {/* Desktop navigation (lg+) — full set, icon-only at lg, labels from xl */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-0.5 bg-white/[0.04] p-1 rounded-full border border-hairline"
          >
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  title={link.name}
                  className={desktopLinkClass(active)}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="hidden xl:inline whitespace-nowrap">{link.short}</span>
                  <span className="sr-only xl:hidden">{link.name}</span>
                  {link.badge && (
                    <span className="bg-primary text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                      {link.badge}
                      <span className="sr-only"> (live now)</span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-white/[0.06] hover:bg-primary/20 text-ink-secondary hover:text-ink border border-hairline transition-colors duration-150"
              aria-label={`Open shopping bag (${totalCount} item${totalCount === 1 ? "" : "s"})`}
            >
              <ShoppingCart className="w-4 h-4" />
              {mounted && totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-primary to-gold text-white text-[9px] font-black flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>

            {mounted && user ? (
              <div className="relative shrink-0 hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen((v) => !v)}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full bg-white/[0.06] border border-hairline hover:border-primary/40 transition-colors duration-150 text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                    alt=""
                    width={32}
                    height={32}
                    decoding="async"
                    className="w-8 h-8 rounded-full bg-surface object-cover border border-gold/40 shrink-0"
                  />
                  <div className="flex flex-col justify-center leading-tight">
                    <span className="text-xs font-bold text-ink truncate max-w-[95px] flex items-center gap-1">
                      <span className="truncate">{user.name}</span>
                      {isPaidPlan(user.plan) && (
                        <BadgeCheck
                          className="w-3 h-3 text-gold shrink-0"
                          aria-label="Verified member"
                        />
                      )}
                    </span>
                    <span className="text-[9px] text-gold font-semibold uppercase tracking-wider flex items-center gap-0.5">
                      {user.plan !== "free" && <Crown className="w-2.5 h-2.5" aria-hidden="true" />}
                      {user.plan} Pass
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                </button>

                {profileDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 shadow-2xl z-50 border border-hairline-strong animate-in fade-in zoom-in-95"
                  >
                    <div className="px-3 py-2 border-b border-hairline">
                      <p className="text-xs font-bold text-ink truncate">{user.name}</p>
                      <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        role="menuitem"
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-primary/20 hover:text-ink rounded-lg transition"
                      >
                        <UserIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                        Celebration Profile
                      </Link>
                      <Link
                        role="menuitem"
                        href="/pricing"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-gold/20 hover:text-ink rounded-lg transition"
                      >
                        <Crown className="w-4 h-4 text-gold" aria-hidden="true" />
                        VIP Passes
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-hairline">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/20 rounded-lg transition text-left"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-ink-secondary hover:text-ink bg-white/[0.05] hover:bg-white/[0.1] border border-hairline transition-colors duration-150"
                >
                  <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary btn-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Join Celebration
                </Link>
              </div>
            )}

            <div className="lg:hidden flex items-center">
              <button
                ref={hamburgerRef}
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                className="p-2.5 rounded-2xl bg-white/[0.06] border border-hairline text-ink hover:bg-white/[0.1] transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="lg:hidden glass-card border-t border-hairline px-4 pt-4 pb-6 mt-3 space-y-2 max-w-7xl mx-auto shadow-2xl animate-in slide-in-from-top-2"
        >
          <nav aria-label="Mobile" className="space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between p-3 rounded-2xl text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-primary to-gold text-white shadow-md"
                      : "text-ink-secondary hover:bg-white/[0.06] hover:text-ink"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {link.name}
                  </span>
                  {link.badge && (
                    <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-hairline flex flex-col gap-2">
            {mounted && user ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                    alt=""
                    width={36}
                    height={36}
                    decoding="async"
                    className="w-9 h-9 rounded-full object-cover border border-gold/40"
                  />
                  <div>
                    <p className="text-sm font-bold text-ink">{user.name}</p>
                    <p className="text-[11px] text-ink-muted">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] text-ink text-sm font-medium"
                >
                  <UserIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-danger/20 text-danger text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 rounded-2xl border border-hairline text-sm text-ink-secondary font-semibold hover:bg-white/5 hover:text-ink transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 rounded-2xl bg-gradient-to-r from-primary to-gold text-white text-sm font-bold shadow-lg"
                >
                  Join Celebration
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
