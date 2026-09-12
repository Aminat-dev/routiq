import { Sparkles } from "lucide-react";

export default function LoadingSpinner({ full = false, size = 24 }) {
  if (!full) {
    return (
      <div
        className="animate-spin rounded-full border-2 border-brand-100 dark:border-brand-500/20 border-t-brand-600"
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  return (
    <div className="min-h-[55vh] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-2xl bg-brand-50 dark:bg-brand-500/10" />

          <div className="absolute inset-[5px] rounded-xl border-2 border-brand-100 dark:border-brand-500/20 border-t-brand-600 animate-spin" />

          <div className="absolute inset-0 flex items-center justify-center text-brand-700 dark:text-brand-300">
            <Sparkles size={17} />
          </div>
        </div>

        <div className="mt-4 text-sm font-medium">Loading your routine</div>

        <div className="mt-1 text-xs text-muted">
          Gathering your latest progress...
        </div>
      </div>
    </div>
  );
}
