import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import api from "../api/axios.js";
import Markdown from "./Markdown.jsx";

export default function AIWeeklyReport() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/weekly-report");
      setContent(res.data.content);
      setGeneratedAt(new Date());
    } catch (e) {
      setContent("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-brand-900 text-white p-5 md:p-6 overflow-hidden">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-300">
          <Sparkles size={18} />
        </div>

        <div>
          <div className="text-sm font-medium">Routiq AI</div>

          <div className="text-xs text-brand-200/70">
            Weekly habit intelligence
          </div>
        </div>
      </div>

      {!content && (
        <>
          <h3 className="text-xl font-semibold leading-tight">
            Understand the story behind your week.
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-brand-100/75">
            Routiq can look at your recent activity and highlight patterns,
            progress, and useful adjustments.
          </p>

          <button
            onClick={generate}
            disabled={loading}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-900 px-4 py-2.5 text-sm font-semibold hover:bg-brand-50 transition"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Analysing...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate insight
              </>
            )}
          </button>
        </>
      )}

      {content && (
        <>
          <div className="rounded-2xl bg-white/[0.07] border border-white/10 p-4 text-sm leading-relaxed">
            <Markdown>{content}</Markdown>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-brand-200/60">
              {generatedAt
                ? `Generated ${generatedAt.toLocaleTimeString()}`
                : "Generated now"}
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs text-brand-200 hover:text-white transition"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </>
      )}
    </div>
  );
}
