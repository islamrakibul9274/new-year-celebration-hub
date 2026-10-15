"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { triggerFestiveConfetti, triggerFireworksShower } from "@/components/effects/ConfettiTrigger";
import { Sparkles, PartyPopper, Flame, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const target = new Date(now.getFullYear(), 11, 31, 23, 59, 59).getTime();

    const updateTimer = () => {
      const current = new Date().getTime();
      const difference = target - current;

      if (difference > 0) {
        setCelebrating(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setCelebrating(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden festive-mesh-bg">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-gold/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-hairline-strong backdrop-blur-md mb-6 animate-bounce">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-xs font-bold tracking-widest uppercase text-gold">
            Happy New Year • Celebration 2026
          </span>
          <Flame className="w-4 h-4 text-primary" />
        </div>

        {/* Main Hero Typography */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink max-w-4xl mx-auto leading-[1.1] mb-6">
          New Year Party <br />
          <span className="festive-gradient-text">Celebration</span>
        </h1>

        <p className="text-base sm:text-xl text-ink-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Welcome to the most dazzling midnight countdown experience. Explore exclusive holiday deals, generate AI resolutions, and join live celebration lounges worldwide.
        </p>

        {/* Live Midnight Countdown Clock */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto mb-12 p-3 sm:p-5 rounded-card glass-card border border-hairline-strong">
          {celebrating ? (
            <div className="col-span-4 py-6 text-center space-y-2">
              <p className="text-2xl sm:text-4xl font-black festive-gradient-text">Happy New Year! 🎆</p>
              <p className="text-xs text-ink-muted uppercase tracking-widest font-bold">
                The midnight celebration is live
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.04] border border-hairline">
                <span className="text-2xl sm:text-4xl font-black text-primary font-mono">
                  {mounted ? String(timeLeft.days).padStart(2, "0") : "--"}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-ink-muted font-semibold mt-1">
                  Days
                </span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.04] border border-hairline">
                <span className="text-2xl sm:text-4xl font-black text-gold font-mono">
                  {mounted ? String(timeLeft.hours).padStart(2, "0") : "--"}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-ink-muted font-semibold mt-1">
                  Hours
                </span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.04] border border-hairline">
                <span className="text-2xl sm:text-4xl font-black text-success font-mono">
                  {mounted ? String(timeLeft.minutes).padStart(2, "0") : "--"}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-ink-muted font-semibold mt-1">
                  Mins
                </span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.04] border border-hairline">
                <span className="text-2xl sm:text-4xl font-black text-violet-400 font-mono">
                  {mounted ? String(timeLeft.seconds).padStart(2, "0") : "--"}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-ink-muted font-semibold mt-1">
                  Secs
                </span>
              </div>
            </>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/events"
            onClick={() => triggerFestiveConfetti(0.5)}
            className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-primary via-rose-600 to-gold text-ink font-bold text-sm shadow-xl shadow-primary/30 hover:scale-105 transition-all"
          >
            <PartyPopper className="w-5 h-5" />
            <span>Join Midnight Party</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => triggerFireworksShower()}
            className="flex items-center gap-2 px-7 py-4 rounded-full glass border border-hairline-strong text-ink font-semibold text-sm hover:bg-white/10 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Launch Fireworks</span>
          </button>
        </div>
      </div>
    </section>
  );
}
