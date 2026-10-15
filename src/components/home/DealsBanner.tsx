"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Gift, Tag, ArrowUpRight, Zap } from "lucide-react";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";

export default function DealsBanner() {
  return (
    <section className="py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-card glass-card border border-primary/30 p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-rose-500/40 text-primary text-xs font-extrabold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>Special Holiday Deals</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-5xl sm:text-7xl font-black tracking-tight text-ink">
                  <span className="text-primary text-glow-red">65%</span> OFF
                </h2>
                <p className="text-xl sm:text-2xl font-bold tracking-wide text-gold">
                  OUR HOLIDAY DEALS ARE BETTER
                </p>
                <h3 className="text-base sm:text-lg uppercase tracking-widest text-ink-secondary font-semibold">
                  ALL CATEGORIES & GIFT PACKS
                </h3>
              </div>

              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-xl">
                Unwrap exceptional discounts across holiday hampers, fireworks bundles, party supplies, and VIP gala tickets. Use promo code{" "}
                <span className="font-mono text-gold bg-black/40 px-2 py-1 rounded border border-gold/30 font-bold">
                  NYE2026
                </span>{" "}
                at checkout!
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/deals"
                  onClick={() => triggerFestiveConfetti(0.4)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-gold text-ink font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-95 transition"
                >
                  <Gift className="w-4 h-4" />
                  <span>Shop Holiday Deals</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/pricing"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.08] hover:bg-white/15 text-ink font-semibold text-sm border border-hairline-strong transition"
                >
                  <Zap className="w-4 h-4 text-gold" />
                  <span>Get VIP Pass</span>
                </Link>
              </div>
            </div>

            {/* Right Graphic Banner */}
            <div className="lg:col-span-5 flex justify-center relative">
              <Image
                src="/images/New Year Photo.webp"
                alt="New Year 2026 celebration deals — 65% off holiday gift bundles"
                width={640}
                height={480}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="relative rounded-2xl w-full max-w-md object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
