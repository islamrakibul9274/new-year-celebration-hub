"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function OffersSection() {
  return (
    <section className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Column 1: Incoming Offer Text */}
          <div className="space-y-4 p-8 rounded-card glass-card border border-hairline">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              NEW BEST OFFER
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-ink">
              COMING SOON
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Experience the pinnacle of holiday luxury. Exclusive midnight champagne tastings, fireworks cruise tickets, and tailored party kits.
            </p>
            <div className="pt-2">
              <Link
                href="/deals"
                className="inline-flex items-center gap-2 text-xs font-bold text-gold hover:text-gold"
              >
                <span>View Early Bird Deals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Column 2: Center Celebration Graphic (Ellipse 1.png) */}
          <div className="flex justify-center relative">
            <div className="relative group">
              <div className="absolute -inset-3 bg-primary/30 rounded-full blur-2xl group-hover:scale-110 transition duration-500" />
              <Image
                src="/images/Ellipse 1.webp"
                alt="Decorative glowing celebration ring"
                width={320}
                height={320}
                className="relative w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-full shadow-2xl group-hover:rotate-6 transition-transform duration-200"
              />
            </div>
          </div>

          {/* Column 3: Year Logo & Perk Highlights (Group 96.png) */}
          <div className="space-y-4 p-8 rounded-card glass-card border border-hairline text-left">
            <h3 className="text-4xl sm:text-5xl font-black text-primary tracking-tight">
              2026
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Step into the new year with our AI-driven celebration tools, interactive guest books, and synchronized countdowns.
            </p>
            <div className="pt-2 flex justify-center">
              <Image
                src="/images/Group 96.webp"
                alt="2026 New Year celebration badge"
                width={200}
                height={160}
                className="w-full max-w-[200px] object-contain hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
