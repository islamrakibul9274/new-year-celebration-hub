import { Spinner } from "@/components/ui/Card";

export default function Loading() {
  return (
    <div className="pt-40 pb-24 flex flex-col items-center justify-center gap-4" role="status">
      <Spinner className="w-8 h-8" />
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Preparing the celebration...
      </p>
    </div>
  );
}
