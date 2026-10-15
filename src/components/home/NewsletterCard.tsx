"use client";

import React from "react";
import Image from "next/image";
import { useNewsletter } from "@/hooks/useNewsletter";
import { triggerFestiveConfetti } from "@/components/effects/ConfettiTrigger";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function NewsletterCard() {
  const { email, setEmail, status, message, subscribe } = useNewsletter(() =>
    triggerFestiveConfetti(0.5),
  );

  return (
    <section className="py-20 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-card p-8 sm:p-14 text-center border border-hairline-strong relative overflow-hidden">
          {/* Glow effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/20 rounded-full blur-3xl pointer-events-none" />

          {/* Mail Graphic (Group 61.png) */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-gold flex items-center justify-center shadow-lg shadow-primary/30">
              <Image
                src="/images/Group 61.webp"
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mb-3">
            Subscribe Newsletter
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary max-w-xl mx-auto mb-8 leading-relaxed">
            Get exclusive invites to midnight galas, secret holiday flash deals, and personalized New Year inspiration sent straight to your inbox.
          </p>

          <form onSubmit={subscribe} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address for newsletter
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="flex-1 px-5 py-3.5 rounded-full bg-white/[0.08] border border-hairline-strong text-ink placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 focus:border-rose-500 text-sm"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-gold text-ink font-bold text-sm shadow-lg shadow-primary/30 hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </div>

            {message && (
              <div
                className={`text-xs font-semibold flex items-center justify-center gap-1.5 pt-2 ${
                  status === "success" ? "text-success" : "text-primary"
                }`}
                role={status === "error" ? "alert" : "status"}
              >
                {status === "success" && <CheckCircle2 className="w-4 h-4" />}
                <span>{message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
