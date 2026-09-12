import { useState, useEffect, useRef } from "react";
import { Send, X, Sparkles, RefreshCw, ArrowUpRight } from "lucide-react";
import api from "../api/axios.js";
import Markdown from "./Markdown.jsx";

const SAMPLES = [
  "Which habit am I most consistent with?",
  "What day of the week is strongest for me?",
  "Which habit should I focus on improving next?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi — I’m Routiq AI. Ask me about your habit patterns, consistency, streaks, or what you could improve next.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, loading]);

  const send = async (text) => {
    const question = (text ?? input).trim();

    if (!question || loading) return;

    setInput("");

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: question,
      },
    ]);

    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        question,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: res.data.content,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I couldn't analyse that right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((current) => !current)}
        className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 w-14 h-14 rounded-2xl text-white shadow-xl flex items-center justify-center transition active:scale-95 ${
          open
            ? "bg-brand-900"
            : "bg-gradient-to-br from-brand-500 to-brand-700 hover:scale-105"
        }`}
        aria-label={open ? "Close Routiq AI" : "Open Routiq AI"}
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
      </button>

      {open && (
        <div className="fixed inset-x-3 bottom-36 md:inset-x-auto md:bottom-24 md:right-6 z-40 md:w-[390px] h-[min(72vh,560px)] bg-[var(--surface-strong)] border border-[var(--divider)] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="shrink-0 bg-brand-900 text-white px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-brand-300 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>

              <div className="min-w-0">
                <div className="font-semibold">Routiq AI</div>

                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-100/65">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  Personal habit intelligence
                </div>
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-7 h-7 mt-1 mr-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0">
                    <Sparkles size={12} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] px-3.5 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-2xl rounded-br-md bg-brand-700 text-white"
                      : "rounded-2xl rounded-bl-md border border-[var(--divider)] bg-[var(--surface)] text-soft"
                  }`}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <Markdown>{message.content}</Markdown>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 mt-1 mr-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 flex items-center justify-center">
                  <Sparkles size={12} />
                </div>

                <div className="rounded-2xl rounded-bl-md border border-[var(--divider)] bg-[var(--surface)] px-3.5 py-3 text-sm text-muted flex items-center gap-2">
                  <RefreshCw size={13} className="animate-spin" />
                  Analysing your data...
                </div>
              </div>
            )}

            {/* Suggestions */}
            {messages.length === 1 && !loading && (
              <div className="pt-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted mb-2">
                  Try asking
                </div>

                <div className="space-y-2">
                  {SAMPLES.map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => send(sample)}
                      className="w-full group flex items-center justify-between gap-3 text-left rounded-xl border border-[var(--divider)] bg-[var(--surface)] px-3 py-2.5 text-xs text-soft hover:bg-[var(--surface-hover)] hover:border-brand-500/20 transition"
                    >
                      <span>{sample}</span>

                      <ArrowUpRight
                        size={13}
                        className="text-faint group-hover:text-brand-600 transition shrink-0"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="shrink-0 border-t border-[var(--divider)] bg-[var(--surface-strong)] p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                className="input resize-none min-h-[44px] max-h-28"
                rows={1}
                placeholder="Ask Routiq about your progress..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />

              <button
                type="submit"
                className="btn-primary w-11 h-11 px-0 shrink-0"
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>

            <div className="mt-2 text-[10px] text-faint px-1">
              Enter to send · Shift + Enter for a new line
            </div>
          </form>
        </div>
      )}
    </>
  );
}
