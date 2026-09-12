import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format, addWeeks, isSameWeek } from "date-fns";
import api from "../api/axios.js";
import WeeklyGrid from "../components/WeeklyGrid.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { weekKeysFor } from "../utils/dateHelpers.js";

export default function Weekly() {
  const [cursor, setCursor] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => weekKeysFor(cursor), [cursor]);
  const isCurrentWeek = isSameWeek(cursor, new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const start = days[0].key;
        const end = days[days.length - 1].key;
        const [habitsRes, rangeRes] = await Promise.all([
          api.get("/habits"),
          api.get("/logs/range", { params: { start, end } }),
        ]);
        setHabits(habitsRes.data);
        setLogs(rangeRes.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  const logsByHabit = useMemo(() => {
    const out = {};
    for (const l of logs) {
      if (!out[l.habitId]) out[l.habitId] = [];
      out[l.habitId].push(l.completedDate);
    }
    return out;
  }, [logs]);

  const totalSlots = habits.length * 7;
  const totalDone = logs.length;
  const weekRate = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;

  const dayTotals = days.map((d) => ({
    ...d,
    count: logs.filter((l) => l.completedDate === d.key).length,
  }));
  const bestDay = [...dayTotals].sort((a, b) => b.count - a.count)[0];

  const perHabitDone = habits
    .map((h) => ({
      h,
      count: (logsByHabit[h._id] || []).length,
    }))
    .sort((a, b) => b.count - a.count);
  const topHabit = perHabitDone[0];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm text-muted">Weekly rhythm</div>

          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
            Your week
          </h1>

          <p className="mt-2 text-sm text-soft max-w-xl">
            See how consistently you showed up across your habits this week.
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn-secondary px-3"
            onClick={() => setCursor((d) => addWeeks(d, -1))}
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-(--divider) bg-(--surface-strong) text-sm font-medium">
            <CalendarDays
              size={15}
              className="text-brand-600 dark:text-brand-300"
            />
            {format(days[0].date, "MMM d")} —{" "}
            {format(days[6].date, "MMM d, yyyy")}
          </div>

          <button
            className="btn-secondary px-3"
            onClick={() => setCursor((d) => addWeeks(d, 1))}
            disabled={isCurrentWeek}
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </button>

          {!isCurrentWeek && (
            <button
              className="btn-ghost px-3"
              onClick={() => setCursor(new Date())}
            >
              Current week
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner full />
      ) : (
        <>
          {/* Weekly summary */}
          <section>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {/* Week rate */}
              <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-4">
                <div className="text-xs text-muted">Completion rate</div>

                <div className="mt-2 flex items-end gap-1">
                  <span className="text-2xl font-semibold">{weekRate}</span>

                  <span className="text-sm text-muted mb-0.5">%</span>
                </div>

                <div className="mt-2 h-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-500"
                    style={{ width: `${weekRate}%` }}
                  />
                </div>

                <div className="text-xs text-muted mt-2">
                  {totalDone} of {totalSlots} habit opportunities
                </div>
              </div>

              {/* Total completions */}
              <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-4">
                <div className="text-xs text-muted">Completed</div>

                <div className="mt-2 text-2xl font-semibold">{totalDone}</div>

                <div className="text-xs text-muted mt-2">
                  habits completed this week
                </div>
              </div>

              {/* Best day */}
              <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-4">
                <div className="text-xs text-muted">Strongest day</div>

                <div className="mt-2 text-xl font-semibold">
                  {bestDay?.count ? bestDay.label : "—"}
                </div>

                <div className="text-xs text-muted mt-2">
                  {bestDay?.count
                    ? `${bestDay.count} habit${
                        bestDay.count === 1 ? "" : "s"
                      } completed`
                    : "No completions yet"}
                </div>
              </div>

              {/* Top habit */}
              <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-4">
                <div className="text-xs text-muted">Most consistent habit</div>

                {topHabit?.count ? (
                  <>
                    <div className="mt-2 flex items-center gap-2 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{
                          background: `${topHabit.h.color}18`,
                          color: topHabit.h.color,
                        }}
                      >
                        {topHabit.h.icon}
                      </div>

                      <div className="font-semibold truncate">
                        {topHabit.h.name}
                      </div>
                    </div>

                    <div className="text-xs text-muted mt-2">
                      Completed {topHabit.count} of 7 days
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-2 text-xl font-semibold">—</div>

                    <div className="text-xs text-muted mt-2">
                      No completions yet
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Weekly activity */}
          <section>
            <div className="mb-4">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Activity
              </div>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Habit consistency
              </h2>

              <p className="mt-1 text-sm text-muted">
                A simple view of which habits you completed each day.
              </p>
            </div>

            {habits.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-(--divider) bg-(--surface) px-6 py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 flex items-center justify-center mx-auto">
                  <CalendarDays size={22} />
                </div>

                <h3 className="mt-4 font-semibold">No habits to review yet</h3>

                <p className="mt-2 text-sm text-muted max-w-sm mx-auto leading-relaxed">
                  Once you create habits and begin completing them, your weekly
                  pattern will appear here.
                </p>
              </div>
            ) : (
              <WeeklyGrid
                habits={habits}
                logsByHabit={logsByHabit}
                days={days}
              />
            )}
          </section>

          {/* Small weekly context */}
          {habits.length > 0 && (
            <div className="rounded-2xl border border-brand-500/10 bg-brand-50/50 dark:bg-brand-500/5 px-5 py-4">
              <p className="text-sm text-soft leading-relaxed">
                A perfect week isn't the goal. Look for the routines you can
                repeat consistently, then improve them gradually.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
