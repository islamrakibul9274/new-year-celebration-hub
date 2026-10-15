"use client";

import React from "react";
import { Check } from "lucide-react";
import { checkPassword } from "@/lib/validators";

const BARS = [
  { label: "Too weak", color: "bg-danger", text: "text-danger" },
  { label: "Weak", color: "bg-orange-500", text: "text-orange-400" },
  { label: "Fair", color: "bg-gold", text: "text-gold" },
  { label: "Good", color: "bg-lime-500", text: "text-lime-400" },
  { label: "Strong", color: "bg-success", text: "text-success" },
];

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const result = checkPassword(password);
  const bar = BARS[result.score];
  const active = password.length > 0;

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1" role="presentation">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-150 ${
                active && i < result.score ? bar.color : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-bold ${active ? bar.text : "text-ink-muted"}`}>
          {active ? result.label : "—"}
        </span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
        {result.requirements.map((req) => (
          <li
            key={req.label}
            className={`flex items-center gap-1.5 text-[11px] ${
              req.met ? "text-success" : "text-ink-muted"
            }`}
          >
            <Check className={`w-3 h-3 shrink-0 ${req.met ? "opacity-100" : "opacity-30"}`} aria-hidden="true" />
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
