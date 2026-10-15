import { Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="pt-48 pb-24 max-w-md mx-auto px-4 text-center space-y-4">
      <div className="text-6xl font-black text-primary font-mono">404</div>
      <h2 className="text-2xl font-bold text-ink">Party Page Not Found</h2>
      <p className="text-sm text-ink-muted">
        The festive page you are looking for doesn&apos;t exist or has moved.
      </p>
      <div className="pt-4">
        <ButtonLink href="/">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Return to Celebration Hub
        </ButtonLink>
      </div>
    </div>
  );
}
