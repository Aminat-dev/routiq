import { useState } from "react";
import {
  Sparkles,
  Check,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Target,
  Clock3,
  AlertCircle,
} from "lucide-react";
import Modal from "./Modal.jsx";
import api from "../api/axios.js";

const steps = [
  {
    label: "Goals",
    title: "What are you working toward?",
    description:
      "Tell Routiq what you want to improve so the suggestions fit your priorities.",
    icon: Target,
  },
  {
    label: "Timing",
    title: "When do you usually perform best?",
    description:
      "Your strongest time of day helps Routiq recommend routines that are easier to maintain.",
    icon: Clock3,
  },
  {
    label: "Challenges",
    title: "What usually gets in the way?",
    description:
      "Share the habits or situations you struggle to stay consistent with.",
    icon: AlertCircle,
  },
];

export default function HabitSuggestionModal({ open, onClose, onAccept }) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState("");
  const [productiveTime, setProductiveTime] = useState("");
  const [struggles, setStruggles] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState({});

  const reset = () => {
    setStep(0);
    setGoals("");
    setProductiveTime("");
    setStruggles("");
    setSuggestions([]);
    setAdded({});
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    setLoading(true);

    try {
      const res = await api.post("/ai/suggest-habits", {
        goals,
        productiveTime,
        struggles,
      });

      setSuggestions(res.data.suggestions || []);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (suggestion, index) => {
    await onAccept(suggestion);

    setAdded((current) => ({
      ...current,
      [index]: true,
    }));
  };

  const currentStep = steps[step];
  const StepIcon = currentStep?.icon;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Build habits with Routiq AI"
      maxWidth="max-w-2xl"
    >
      {step < 3 && (
        <div className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-medium text-muted">
                Step {step + 1} of 3
              </div>

              <div className="text-xs font-medium text-brand-700 dark:text-brand-300">
                {currentStep.label}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition ${
                    index <= step ? "bg-brand-600" : "bg-[var(--divider)]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="rounded-3xl border border-brand-500/10 bg-brand-50/60 dark:bg-brand-500/[0.05] p-5">
            <div className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center">
              <StepIcon size={18} />
            </div>

            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              {currentStep.title}
            </h3>

            <p className="mt-2 text-sm text-muted leading-relaxed max-w-lg">
              {currentStep.description}
            </p>
          </div>

          {step === 0 && (
            <div>
              <label className="label">Your current goals</label>

              <textarea
                className="input resize-none min-h-[120px]"
                rows={4}
                placeholder="e.g. Improve my fitness, read every day, reduce screen time..."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <label className="label">Your most productive time</label>

              <textarea
                className="input resize-none min-h-[120px]"
                rows={4}
                placeholder="e.g. I have the most energy between 6–9 AM..."
                value={productiveTime}
                onChange={(e) => setProductiveTime(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="label">Your consistency challenges</label>

              <textarea
                className="input resize-none min-h-[120px]"
                rows={4}
                placeholder="e.g. I usually skip exercise when I wake up late..."
                value={struggles}
                onChange={(e) => setStruggles(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              {step === 0 ? (
                <button type="button" className="btn-ghost" onClick={close}>
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setStep((current) => current - 1)}
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              )}
            </div>

            {step < 2 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep((current) => current + 1)}
                disabled={step === 0 ? !goals.trim() : !productiveTime.trim()}
              >
                Continue
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={submit}
                disabled={loading || !struggles.trim()}
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Building your suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate habits
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {/* Result header */}
          <div className="rounded-3xl bg-brand-900 text-white p-5">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-brand-300 flex items-center justify-center">
              <Sparkles size={17} />
            </div>

            <div className="mt-4 text-xs font-medium uppercase tracking-[0.15em] text-brand-300">
              Routiq AI
            </div>

            <h3 className="mt-1 text-xl font-semibold">
              Habits designed around you
            </h3>

            <p className="mt-2 text-sm text-brand-100/70 leading-relaxed">
              These suggestions are based on your goals, preferred timing, and
              the areas where consistency has been difficult.
            </p>
          </div>

          {suggestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--divider)] p-8 text-center">
              <div className="text-sm font-medium">No suggestions returned</div>

              <p className="mt-2 text-sm text-muted">
                Try adjusting your answers and generating another set.
              </p>

              <button
                type="button"
                className="btn-secondary mt-4"
                onClick={() => setStep(0)}
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[var(--divider)] bg-[var(--surface)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-xl shrink-0">
                      {suggestion.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold">{suggestion.name}</h4>

                        <span className="text-[11px] px-2 py-1 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
                          {suggestion.category}
                        </span>

                        <span className="text-[11px] px-2 py-1 rounded-lg bg-[var(--surface-hover)] text-muted capitalize">
                          {suggestion.frequency}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-soft leading-relaxed">
                        {suggestion.description}
                      </p>

                      {suggestion.reason && (
                        <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 px-3 py-2.5">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-amber-700 dark:text-amber-300">
                            Why Routiq recommends it
                          </div>

                          <p className="mt-1 text-xs leading-relaxed text-soft">
                            {suggestion.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--divider)] flex justify-end">
                    {added[index] ? (
                      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 dark:text-brand-300">
                        <Check size={15} />
                        Added to your routine
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => accept(suggestion, index)}
                      >
                        <Check size={14} />
                        Add habit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setStep(0)}
            >
              <RefreshCw size={14} />
              Start over
            </button>

            <button type="button" className="btn-secondary" onClick={close}>
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
