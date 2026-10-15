"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return <Tag className={`glass-card rounded-card ${className}`}>{children}</Tag>;
}

export function Badge({
  children,
  tone = "primary",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "primary" | "gold" | "success" | "neutral";
  className?: string;
}) {
  const toneClass =
    tone === "gold"
      ? "badge-gold"
      : tone === "success"
        ? "badge-success"
        : tone === "neutral"
          ? "bg-white/[0.06] text-ink-secondary border border-hairline"
          : "badge-primary";
  return <span className={`badge ${toneClass} ${className}`}>{children}</span>;
}

export function Spinner({ className = "w-5 h-5" }: { className?: string }) {
  return <Loader2 className={`animate-spin text-primary ${className}`} aria-hidden="true" />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-center py-14 px-6 space-y-3 ${className}`}>
      {icon && (
        <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-ink-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-sm mx-auto">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function Alert({
  tone = "error",
  children,
  className = "",
}: {
  tone?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    error: "bg-danger-soft border-danger/40 text-danger",
    success: "bg-success-soft border-success/40 text-success",
    info: "bg-primary-soft border-primary/40 text-primary-hover",
  };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`p-3 rounded-control border text-sm font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
