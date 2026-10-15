"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SessionExpiredBanner() {
  const { sessionExpired, dismissSessionExpired } = useAuth();
  if (!sessionExpired) return null;
  return (
    <div
      role="status"
      className="relative z-40 bg-amber-500/15 border-b border-amber-500/30 text-amber-200 px-4 py-2.5"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <span className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Your session has expired. Please{" "}
          <Link href="/login" className="font-bold underline hover:text-amber-100">
            sign in again
          </Link>{" "}
          to continue.
        </span>
        <button
          onClick={dismissSessionExpired}
          aria-label="Dismiss session notice"
          className="p-1 rounded-lg hover:bg-amber-500/20 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
