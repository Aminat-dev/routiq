import { useEffect, useMemo, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import api from "../api/axios.js";
import HabitStatsCard from "../components/HabitStatsCard.jsx";
import WeeklyBarChart from "../components/WeeklyBarChart.jsx";
import MonthlyBarChart from "../components/MonthlyBarChart.jsx";
import CategoryPieChart from "../components/CategoryPieChart.jsx";
import AIChat from "../components/AIChat.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { Trophy, Flame, TrendingDown } from "lucide-react";

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [statsRes, habitsRes] = await Promise.all([
          api.get("/logs/stats"),
          api.get("/habits"),
        ]);
        setStats(statsRes.data);
        setHabits(habitsRes.data);
        const end = new Date();
        const start = subDays(end, 29);
        const rangeRes = await api.get("/logs/range", {
          params: {
            start: format(start, "yyyy-MM-dd"),
            end: format(end, "yyyy-MM-dd"),
          },
        });
        setLogs(rangeRes.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const monthly = useMemo(() => {
    const end = new Date();
    const byDate = {};
    for (let i = 29; i >= 0; i--) {
      const d = subDays(end, i);
      const key = format(d, "yyyy-MM-dd");
      byDate[key] = 0;
    }
    for (const l of logs) {
      if (byDate[l.completedDate] !== undefined) byDate[l.completedDate] += 1;
    }
    return Object.entries(byDate).map(([k, v]) => ({
      label: format(parseISO(k), "MMM d"),
      count: v,
    }));
  }, [logs]);

  const weekly = useMemo(() => {
    const end = new Date();
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(end, i);
      const key = format(d, "yyyy-MM-dd");
      const count = logs.filter((l) => l.completedDate === key).length;
      out.push({ label: format(d, "EEE"), count });
    }
    return out;
  }, [logs]);

  const categoryData = useMemo(() => {
    if (!stats) return [];
    const map = {};
    for (const h of habits) map[h._id] = h.category;
    const counts = {};
    for (const l of logs) {
      const cat = map[l.habitId];
      if (!cat) continue;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [stats, logs, habits]);

  if (loading || !stats) return <LoadingSpinner full />;

  const sortedByStreak = [...stats.perHabit].sort(
    (a, b) => b.currentStreak - a.currentStreak,
  );
  const best = sortedByStreak[0];
  const sortedByComp = [...stats.perHabit].sort(
    (a, b) => b.completions30d - a.completions30d,
  );
  const longestLongest = [...stats.perHabit].sort(
    (a, b) => b.longestStreak - a.longestStreak,
  )[0];
  const worst = [...stats.perHabit]
    .filter((s) => s.completions30d < 30)
    .sort((a, b) => a.completions30d - b.completions30d)[0];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page header */}
      <div>
        <div className="text-sm text-muted">Long-term performance</div>

        <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
          Statistics
        </h1>

        <p className="mt-2 text-sm text-soft max-w-xl">
          A deeper view of your consistency, streaks, and habit performance over
          time.
        </p>
      </div>

      {stats.perHabit.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-var(--divider) bg-var(--surface) px-6 py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 flex items-center justify-center mx-auto">
            <Trophy size={22} />
          </div>

          <h3 className="mt-4 font-semibold">Your statistics are waiting</h3>

          <p className="mt-2 text-sm text-muted max-w-sm mx-auto leading-relaxed">
            Complete your habits a few times and Routiq will start building a
            clearer picture of your progress.
          </p>
        </div>
      ) : (
        <>
          {/* Performance highlights */}
          <section>
            <div className="mb-4">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Highlights
              </div>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Your strongest signals
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {best && (
                <div className="rounded-3xl border border-var(--divider) bg-var(--surface-strong) p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
                    <Flame size={14} className="text-amber-500" />
                    Current momentum
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{
                        background: `${best.color}18`,
                        color: best.color,
                      }}
                    >
                      {best.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold truncate">{best.name}</div>

                      <div className="text-sm text-muted mt-1">
                        {best.currentStreak} day
                        {best.currentStreak === 1 ? "" : "s"} running
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {longestLongest && (
                <div className="rounded-3xl border border-var(--divider) bg-var(--surface-strong) p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                    <Trophy size={14} className="text-amber-500" />
                    Personal record
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{
                        background: `${longestLongest.color}18`,
                        color: longestLongest.color,
                      }}
                    >
                      {longestLongest.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {longestLongest.name}
                      </div>

                      <div className="text-sm text-muted mt-1">
                        {longestLongest.longestStreak} day
                        {longestLongest.longestStreak === 1 ? "" : "s"} longest
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {worst && (
                <div className="rounded-3xl border border-var(--divider) bg-var(--surface-strong) p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                    <TrendingDown size={14} />
                    Needs attention
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{
                        background: `${worst.color}18`,
                        color: worst.color,
                      }}
                    >
                      {worst.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold truncate">{worst.name}</div>

                      <div className="text-sm text-muted mt-1">
                        {worst.completions30d}/30 completions
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Activity trends */}
          <section>
            <div className="mb-4">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Activity
              </div>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Consistency over time
              </h2>

              <p className="mt-1 text-sm text-muted">
                See how frequently you have been completing habits recently.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <WeeklyBarChart data={weekly} title="Last 7 days" />

              <MonthlyBarChart data={monthly} />
            </div>
          </section>

          {/* Distribution and rankings */}
          <section>
            <div className="mb-4">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Breakdown
              </div>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Where your consistency lives
              </h2>
            </div>

            <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-5">
              <CategoryPieChart data={categoryData} />

              <div className="rounded-3xl border border-var(--divider) bg-var(--surface-strong) p-5">
                <div className="mb-5">
                  <div className="text-sm font-semibold">Top habits</div>

                  <div className="text-xs text-muted mt-1">
                    Ranked by completions during the last 30 days
                  </div>
                </div>

                <div className="space-y-5">
                  {sortedByComp.slice(0, 5).map((s, index) => {
                    const pct = Math.round((s.completions30d / 30) * 100);

                    return (
                      <div key={s.habitId}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 text-xs font-semibold text-faint">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                            style={{
                              background: `${s.color}18`,
                              color: s.color,
                            }}
                          >
                            {s.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium truncate">
                                {s.name}
                              </span>

                              <span className="text-xs text-muted shrink-0">
                                {s.completions30d}/30
                              </span>
                            </div>

                            <div className="mt-2 h-2 rounded-full overflow-hidden bg-brand-50 dark:bg-brand-500/10">
                              <div
                                className="h-full rounded-full bg-brand-600 transition-all"
                                style={{
                                  width: `${pct}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="text-xs font-medium text-brand-700 dark:text-brand-300 w-10 text-right">
                            {pct}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Full habit stats */}
          <section>
            <div className="mb-4">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Habits
              </div>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Performance by habit
              </h2>

              <p className="mt-1 text-sm text-muted">
                Compare streaks and recent completion activity across your
                routine.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-3">
              {stats.perHabit.map((s) => (
                <HabitStatsCard key={s.habitId} stat={s} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* AI assistant */}
      <section>
        <div className="mb-4">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Routiq AI
          </div>

          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Ask about your progress
          </h2>

          <p className="mt-1 text-sm text-muted">
            Explore your habit data and get personalised guidance.
          </p>
        </div>

        <AIChat />
      </section>
    </div>
  );
}
