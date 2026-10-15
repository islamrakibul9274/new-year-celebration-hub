"use client";

import React from "react";
import Link from "next/link";
import { useNewsletter } from "@/hooks/useNewsletter";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";
import { Sparkles, MapPin, Phone, Globe, Send, Heart, PartyPopper, Loader2 } from "lucide-react";

export default function Footer() {
  const { email, setEmail, status, message, subscribe } = useNewsletter(() =>
    triggerFestiveConfetti(0.8),
  );

  return (
    <footer className="relative z-10 bg-canvas border-t border-hairline pt-16 pb-12 overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-hairline">
          {/* Column 1: Brand & Theme */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-gold flex items-center justify-center shadow-lg shadow-primary/30">
                <PartyPopper className="w-5 h-5 text-ink" />
              </div>
              <span className="font-extrabold text-lg tracking-wider text-ink">
                NEW YEAR <span className="text-gold">2026</span>
              </span>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              Step into the ultimate New Year celebration. Featuring live countdown lounges, AI resolution coaches, exclusive holiday deals, and VIP midnight gala passes.
            </p>
            <div className="flex items-center gap-3 text-xs text-gold/90 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Celebrating New Beginnings Worldwide</span>
            </div>
          </div>

          {/* Column 2: Venue & Contact Info (Preserving original) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-ink">Event Venue & Contact</h4>
            <ul className="space-y-2.5 text-sm text-ink-muted">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>44, Big Building Roosevelt Street, Beach Garden Florida 33410</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>+00 123 584 124</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-success shrink-0" />
                <span>www.newyearcelebration.com</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-ink">Explore Celebration</h4>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li>
                <Link href="/events" className="hover:text-primary transition">Midnight Party & Schedule</Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-primary transition">Holiday 65% OFF Deals</Link>
              </li>
              <li>
                <Link href="/ai-resolutions" className="hover:text-primary transition">AI Resolution Studio</Link>
              </li>
              <li>
                <Link href="/live-lounge" className="hover:text-primary transition">Real-Time Party Lounge</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition">VIP Membership Passes</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-ink">Stay In The Loop</h4>
            <p className="text-xs text-ink-muted">
              Subscribe to get secret midnight discounts, VIP early passes, and AI celebration tips.
            </p>
            <form onSubmit={subscribe} className="space-y-2">
              <div className="relative">
                <label htmlFor="footer-newsletter-email" className="sr-only">
                  Email address for newsletter
                </label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.06] border border-hairline-strong text-ink placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500 pr-10"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary text-ink hover:bg-rose-600 transition disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {message && (
                <div
                  className={`text-[11px] flex items-center gap-1.5 ${
                    status === "success" ? "text-success" : "text-primary"
                  }`}
                  role={status === "error" ? "alert" : "status"}
                >
                  <span>{message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Contact & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted">
            <span>&copy; {new Date().getFullYear()} New Year Celebration. All Rights Reserved.</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-primary">
              Crafted with <Heart className="w-3 h-3 fill-rose-500" /> for the New Year
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
