"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Users, Flame } from "lucide-react";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";

export default function PartySection() {
  return (
    <section className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-amber-500/30 text-gold text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Midnight Celebration</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-ink">
                Welcome to
              </h2>
              <h2 className="text-4xl sm:text-6xl font-black festive-gradient-text">
                Midnight Party
              </h2>
            </div>

            <p className="text-ink-secondary text-base sm:text-lg leading-relaxed">
              Step into an electric atmosphere featuring live acoustic concerts, world-class DJ sets, champagne fountains, and rooftop fireworks at midnight. Connect with fellow celebrators and ring in the new year in grand style.
            </p>

            {/* Event Highlights List */}
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-hairline">
                <Flame className="w-5 h-5 text-primary mb-2" />
                <h4 className="text-sm font-bold text-ink">Live Fireworks</h4>
                <p className="text-xs text-ink-muted">Panoramic 360° rooftop display</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-hairline">
                <Users className="w-5 h-5 text-gold mb-2" />
                <h4 className="text-sm font-bold text-ink">500+ Guests</h4>
                <p className="text-xs text-ink-muted">VIP lounge & networking</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/events"
                onClick={() => triggerFestiveConfetti(0.4)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-ink font-bold text-sm shadow-lg shadow-primary/30 hover:bg-rose-600 transition hover:scale-105"
              >
                <span>Join Now & Reserve Spot</span>
              </Link>
            </div>
          </div>

          {/* Right Image Graphic (Group 70.png) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-gold/20 blur-2xl rounded-card" />
              <Image
                src="/images/Group 70.webp"
                alt="Guests celebrating at the 2026 midnight party with fireworks"
                width={640}
                height={560}
                className="relative w-full max-w-lg object-contain drop-shadow-[0_20px_50px_rgba(255,51,102,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
