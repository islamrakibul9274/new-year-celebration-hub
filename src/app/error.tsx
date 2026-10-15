"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PartyPopper, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div className="pt-48 pb-24 max-w-md mx-auto px-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
        <PartyPopper className="w-8 h-8" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold text-ink">Celebration Hiccup</h2>
      <p className="text-sm text-ink-muted">
        Something unexpected occurred. Let&apos;s get you back to the celebration.
      </p>
      <div className="flex gap-3 justify-center pt-2">
        <Button onClick={() => reset()}>
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try Again
        </Button>
        <Link href="/" className="btn btn-secondary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
