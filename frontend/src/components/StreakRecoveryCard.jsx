import { useState } from "react";
import { Heart, RefreshCw, X } from "lucide-react";
import api from "../api/axios.js";
import Markdown from "./Markdown.jsx";

export default function StreakRecoveryCard({ habit, onDismiss }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/recovery-plan", { habitId: habit._id });
      setContent(res.data.content);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-amber-500/15 bg-amber-50/60 dark:bg-amber-500/6 p-4 animate-slide-up">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-muted hover:text-(--text)"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
          <Heart size={17} />
        </div>

        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
            Routine interrupted · {habit.name}
          </div>

          <p className="mt-1 text-sm text-soft leading-relaxed">
            Missing a day doesn't erase your progress. Routiq can help you make
            the next step easier.
          </p>

          {!content ? (
            <button
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-300 hover:underline"
              onClick={generate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Building your recovery plan...
                </>
              ) : (
                "Get a recovery suggestion"
              )}
            </button>
          ) : (
            <div className="mt-3 rounded-xl bg-white/60 dark:bg-white/4 border border-(--divider) p-4 text-sm">
              <Markdown>{content}</Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
