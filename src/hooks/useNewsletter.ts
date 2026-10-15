"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface UseNewsletterResult {
  email: string;
  setEmail: (value: string) => void;
  status: "idle" | "loading" | "success" | "error";
  message: string;
  subscribe: (e: React.FormEvent) => Promise<void>;
}

export function useNewsletter(onSuccess?: () => void): UseNewsletterResult {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<UseNewsletterResult["status"]>("idle");
  const [message, setMessage] = useState("");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing!");
        setEmail("");
        onSuccess?.();
        toast("You're on the list — welcome to the inner circle!", "success");
      } else {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return { email, setEmail, status, message, subscribe };
}
