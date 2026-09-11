import { useEffect, useState } from "react";
import { Sun, X } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Markdown from "./Markdown.jsx";

export default function MorningMotivation() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.morningMotivation) return;
    const today = new Date().toISOString().slice(0, 10);
    const seen = localStorage.getItem("morning-seen");
    if (seen === today) return;
    setLoading(true);
    api
      .get("/ai/morning")
      .then((res) => {
        setContent(res.data.content);
        localStorage.setItem("morning-seen", today);
      })
      .finally(() => setLoading(false));
  }, [user?.morningMotivation]);

  if (!user?.morningMotivation || dismissed || (!content && !loading))
    return null;

  return (
    <div className="relative rounded-2xl border border-brand-500/15 bg-brand-50/60 dark:bg-brand-500/[0.06] p-4 animate-slide-up">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-muted hover:text-[var(--text)]"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
          <Sun size={18} />
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
            Morning note
          </div>

          <div className="mt-1 text-sm text-soft leading-relaxed">
            {loading ? (
              "Preparing something for your morning..."
            ) : (
              <Markdown>{content}</Markdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
