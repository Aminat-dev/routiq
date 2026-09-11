import { weekKeys } from "../utils/dateHelpers.js";
import { Check } from "lucide-react";

export default function WeeklyGrid({ habits, logsByHabit, days: customDays }) {
  const days = customDays || weekKeys();
  const todayKey = new Date().toISOString().slice(0, 10);

  if (!habits.length) {
    return (
      <div className="card p-6 text-center text-muted text-sm">
        Create a habit to see your weekly grid.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-(--divider) bg-(--surface-strong) p-5 overflow-x-auto">
      <div className="min-w-130">
        <div className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))] gap-2 items-center mb-3">
          <div className="text-xs font-medium text-muted uppercase tracking-[0.14em]">
            Habit
          </div>

          {days.map((d) => (
            <div
              key={d.key}
              className={`text-center text-xs ${
                d.key === todayKey
                  ? "text-brand-700 dark:text-brand-300 font-semibold"
                  : "text-muted"
              }`}
            >
              <div>{d.label}</div>
              <div className="text-faint mt-0.5">{d.short}</div>
            </div>
          ))}
        </div>

        {habits.map((h) => {
          const done = new Set(logsByHabit[h._id] || []);

          return (
            <div
              key={h._id}
              className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))] gap-2 items-center py-3 border-t border-(--divider)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{
                    background: `${h.color}18`,
                    color: h.color,
                  }}
                >
                  {h.icon}
                </span>

                <span className="text-sm truncate">{h.name}</span>
              </div>

              {days.map((d) => {
                const isDone = done.has(d.key);
                const future = d.key > todayKey;

                return (
                  <div key={d.key} className="flex items-center justify-center">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                        isDone
                          ? "bg-brand-600 text-white"
                          : future
                            ? "bg-transparent border border-(--divider) text-faint opacity-50"
                            : "bg-brand-50 dark:bg-brand-500/6 text-faint"
                      }`}
                    >
                      {isDone && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
