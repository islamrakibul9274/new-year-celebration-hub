"use client";

import React from "react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="pt-36 pb-24 max-w-md mx-auto px-4">
      <div className="glass-card rounded-card p-8 sm:p-10 border border-hairline-strong space-y-6 shadow-card relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="text-center space-y-2 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-gold flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <PartyPopper className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink">{title}</h1>
          <p className="text-xs text-ink-muted">{subtitle}</p>
        </div>
        {children}
        {footer && <div className="text-center pt-2 border-t border-hairline">{footer}</div>}
      </div>
      <p className="text-center text-[11px] text-ink-muted mt-6">
        <Link href="/" className="hover:text-ink-secondary transition">
          ← Back to Celebration Hub
        </Link>
      </p>
    </div>
  );
}
