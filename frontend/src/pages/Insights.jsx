import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Trophy,
  CalendarRange,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { format, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import api from "../api/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Markdown from "../components/Markdown.jsx";
import { weekKeysFor, streakFromKeys } from "../utils/dateHelpers.js";
import { useTheme } from "../context/ThemeContext.jsx";

const PIE_COLORS = [
  "#059669",
  "#10B981",
  "#34D399",
  "#047857",
  "#F59E0B",
  "#6B7280",
  "#0F766E",
  "#84CC16",
  "#D97706",
];

const REPORT_CACHE_KEY = (weekStart) => `weekly-report-${weekStart}`;

export default function Insights() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const grid = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,15,27,0.08)";
  const tick = isDark ? "#8a8aa0" : "#6b6b78";
  const tooltipStyle = {
    background: isDark ? "rgba(20,20,36,0.95)" : "rgba(255,255,255,0.95)",
    border: `1px solid ${grid}`,
    borderRadius: 12,
    fontSize: 12,
    color: isDark ? "#ebebf5" : "#13131b",
    backdropFilter: "blur(12px)",
  };

  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState("");
  const [reportGeneratedAt, setReportGeneratedAt] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const thisWeek = useMemo(() => weekKeysFor(new Date()), []);
  const lastWeek = useMemo(() => weekKeysFor(subDays(new Date(), 7)), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const start = lastWeek[0].key;
        const end = thisWeek[6].key;
        const [habitsRes, logsRes] = await Promise.all([
          api.get("/habits"),
          api.get("/logs/range", { params: { start, end } }),
        ]);
        setHabits(habitsRes.data);
        setLogs(logsRes.data);

        // try to load cached report for this week
        const cached = localStorage.getItem(REPORT_CACHE_KEY(thisWeek[0].key));
        if (cached) {
          try {
            const { content, generatedAt } = JSON.parse(cached);
            setReport(content);
            setReportGeneratedAt(new Date(generatedAt));
          } catch {}
        } else {
          // auto-generate on first visit this week
          generateReport();
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const res = await api.post("/ai/weekly-report");
      setReport(res.data.content);
      const now = new Date();
      setReportGeneratedAt(now);
      localStorage.setItem(
        REPORT_CACHE_KEY(thisWeek[0].key),
        JSON.stringify({ content: res.data.content, generatedAt: now }),
      );
    } catch {
      setReport("Failed to generate the report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  // Aggregations
  const thisWeekKeys = useMemo(
    () => new Set(thisWeek.map((d) => d.key)),
    [thisWeek],
  );
  const thisWeekLogs = useMemo(
    () => logs.filter((l) => thisWeekKeys.has(l.completedDate)),
    [logs, thisWeekKeys],
  );
  const lastWeekLogs = useMemo(
    () => logs.filter((l) => !thisWeekKeys.has(l.completedDate)),
    [logs, thisWeekKeys],
  );

  const totalSlots = habits.length * 7;
  const totalDone = thisWeekLogs.length;
  const totalLast = lastWeekLogs.length;
  const completionRate = totalSlots
    ? Math.round((totalDone / totalSlots) * 100)
    : 0;
  const delta = totalDone - totalLast;
  const deltaPct = totalLast
    ? Math.round(((totalDone - totalLast) / totalLast) * 100)
    : totalDone > 0
      ? 100
      : 0;

  const dailyData = thisWeek.map((d) => {
    const count = thisWeekLogs.filter((l) => l.completedDate === d.key).length;
    return { label: d.label, count };
  });

  const compareData = thisWeek.map((d, idx) => {
    const thisCount = thisWeekLogs.filter(
      (l) => l.completedDate === d.key,
    ).length;
    const lastCount = lastWeekLogs.filter(
      (l) => l.completedDate === lastWeek[idx].key,
    ).length;
    return { label: d.label, "This week": thisCount, "Last week": lastCount };
  });

  const bestDay = [...dailyData].sort((a, b) => b.count - a.count)[0];

  const perHabit = useMemo(() => {
    return habits
      .filter((h) => !h.isArchived)
      .map((h) => {
        const done = thisWeekLogs.filter(
          (l) => String(l.habitId) === String(h._id),
        ).length;
        const target = h.targetDays || 7;
        return {
          habit: h,
          done,
          target,
          pct: Math.min(100, Math.round((done / Math.max(1, target)) * 100)),
        };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [habits, thisWeekLogs]);

  const topHabit = perHabit[0];

  const categoryData = useMemo(() => {
    const map = {};
    for (const h of habits) map[h._id] = h.category;
    const counts = {};
    for (const l of thisWeekLogs) {
      const cat = map[l.habitId];
      if (!cat) continue;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [habits, thisWeekLogs]);

  // Streak overview from full 14-day window (rough — accurate streaks need longer)
  const streakBoard = useMemo(() => {
    const out = {};
    for (const h of habits) {
      const keys = logs
        .filter((l) => String(l.habitId) === String(h._id))
        .map((l) => l.completedDate)
        .sort()
        .reverse();
      out[h._id] = streakFromKeys(keys);
    }
    return out;
  }, [habits, logs]);

  const activeStreaks = Object.values(streakBoard).filter(
    (s) => s.current > 0,
  ).length;

  if (loading) return <LoadingSpinner full />;

  const DeltaPill = () => {
    const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
    const color =
      delta > 0
        ? "text-emerald-500 bg-emerald-500/10"
        : delta < 0
          ? "text-rose-500 bg-rose-500/10"
          : "text-faint bg-[var(--chip-bg)]";
    const label =
      delta === 0
        ? "no change"
        : `${delta > 0 ? "+" : ""}${delta} (${deltaPct > 0 ? "+" : ""}${deltaPct}%)`;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
      >
        <Icon size={12} /> {label}
      </span>
    );
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm text-muted">Pattern intelligence</div>

          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
            Insights
          </h1>

          <p className="mt-2 text-sm text-soft max-w-xl">
            Understand what is working, where consistency is slipping, and how
            your routine is changing.
          </p>

          <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted">
            <CalendarRange size={14} />
            {format(thisWeek[0].date, "MMM d")} —{" "}
            {format(thisWeek[6].date, "MMM d, yyyy")}
          </div>
        </div>

        <button
          onClick={generateReport}
          className="btn-secondary"
          disabled={reportLoading}
        >
          <RefreshCw
            size={14}
            className={reportLoading ? "animate-spin" : ""}
          />
          Refresh AI insight
        </button>
      </div>

      {/* AI insight */}
      <section className="rounded-3xl bg-brand-900 text-white p-5 md:p-7 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          <div className="lg:w-70 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-white/10 text-brand-300 flex items-center justify-center">
              <Sparkles size={19} />
            </div>

            <div className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-brand-300">
              Routiq AI
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Your weekly pattern
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-brand-100/70">
              A personalised interpretation of your recent habit activity.
            </p>

            <div className="mt-4 text-xs text-brand-200/60">
              {reportGeneratedAt
                ? `Generated ${reportGeneratedAt.toLocaleString()}`
                : "Waiting for this week's insight"}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {reportLoading && !report && (
              <div className="min-h-40 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-brand-100/75">
                  <RefreshCw size={15} className="animate-spin" />
                  Analysing your routine...
                </div>
              </div>
            )}

            {report && (
              <div className="rounded-2xl border border-white/10 bg-white/6 p-5 text-sm leading-relaxed">
                <Markdown>{report}</Markdown>
              </div>
            )}

            {!report && !reportLoading && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-brand-100/70">
                  Generate an AI review of your recent consistency, strongest
                  routines, and areas that may need adjustment.
                </p>

                <button
                  onClick={generateReport}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-900 px-4 py-2.5 text-sm font-semibold hover:bg-brand-50 transition"
                >
                  <Sparkles size={14} />
                  Generate insight
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Summary */}
      <section>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Activity size={14} />
              Completions
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="text-2xl font-semibold">{totalDone}</div>
              // eslint-disable-next-line react-hooks/static-components
              <DeltaPill />
            </div>

            <div className="mt-1 text-xs text-muted">
              compared with last week
            </div>
          </div>

          <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <TrendingUp size={14} />
              Completion rate
            </div>

            <div className="mt-2 text-2xl font-semibold">{completionRate}%</div>

            <div className="mt-2 h-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <div className="mt-1 text-xs text-muted">
              {totalDone} of {totalSlots} opportunities
            </div>
          </div>

          <div className="rounded-2xl border border-(--divider) bg-(--surface-strong)p-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <CalendarRange size={14} />
              Strongest day
            </div>

            <div className="mt-2 text-xl font-semibold">
              {bestDay?.count ? bestDay.label : "—"}
            </div>

            <div className="mt-1 text-xs text-muted">
              {bestDay?.count
                ? `${bestDay.count} completion${bestDay.count === 1 ? "" : "s"}`
                : "No activity yet"}
            </div>
          </div>

          <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Trophy size={14} />
              Top habit
            </div>

            {topHabit?.done ? (
              <>
                <div className="mt-2 flex items-center gap-2 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{
                      background: `${topHabit.habit.color}18`,
                      color: topHabit.habit.color,
                    }}
                  >
                    {topHabit.habit.icon}
                  </div>

                  <div className="font-semibold truncate">
                    {topHabit.habit.name}
                  </div>
                </div>

                <div className="mt-1 text-xs text-muted">
                  {topHabit.done}/{topHabit.target} this week
                </div>
              </>
            ) : (
              <>
                <div className="mt-2 text-xl font-semibold">—</div>

                <div className="mt-1 text-xs text-muted">
                  No completions yet
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Trends */}
      <section>
        <div className="mb-4">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Trends
          </div>

          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            How your week is moving
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Daily completions */}
          <div className="rounded-3xl border border-(--divider) bg-(--surface-strong) p-5">
            <div className="mb-4">
              <div className="text-sm font-semibold">Daily completions</div>

              <div className="mt-1 text-xs text-muted">
                Number of habits completed each day
              </div>
            </div>

            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={grid}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: tick }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 12, fill: tick }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: isDark
                        ? "rgba(255,255,255,0.035)"
                        : "rgba(16,185,129,0.04)",
                    }}
                    contentStyle={tooltipStyle}
                  />

                  <Bar dataKey="count" fill="#059669" radius={[7, 7, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Week comparison */}
          <div className="rounded-3xl border border-(--divider) bg-(--surface-strong) p-5">
            <div className="mb-4">
              <div className="text-sm font-semibold">Week comparison</div>

              <div className="mt-1 text-xs text-muted">
                Your current week compared with the previous one
              </div>
            </div>

            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={compareData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={grid}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: tick }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 12, fill: tick }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip contentStyle={tooltipStyle} />

                  <Legend
                    wrapperStyle={{ fontSize: 12, color: tick }}
                    iconType="circle"
                    iconSize={7}
                  />

                  <Bar
                    dataKey="Last week"
                    fill={isDark ? "#374151" : "#D1D5DB"}
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="This week"
                    fill="#059669"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section>
        <div className="mb-4">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Performance
          </div>

          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Where your effort is going
          </h2>
        </div>

        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-5">
          {/* Categories */}
          <div className="rounded-3xl border border-(--divider) bg-(--surface-strong) p-5">
            <div className="text-sm font-semibold">By category</div>

            <div className="mt-1 text-xs text-muted">
              Distribution of this week's completions
            </div>

            {!categoryData.length ? (
              <div className="text-sm text-muted py-16 text-center">
                No category activity yet.
              </div>
            ) : (
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={3}
                      stroke={isDark ? "#071711" : "#ffffff"}
                      strokeWidth={3}
                    >
                      {categoryData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip contentStyle={tooltipStyle} />

                    <Legend
                      wrapperStyle={{ fontSize: 12, color: tick }}
                      iconType="circle"
                      iconSize={7}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Habit performance */}
          <div className="rounded-3xl border border-(--divider) bg-(--surface-strong) p-5">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="text-sm font-semibold">Habit performance</div>

                <div className="mt-1 text-xs text-muted">
                  Progress against each habit's weekly target
                </div>
              </div>
            </div>

            {!perHabit.length ? (
              <div className="text-sm text-muted py-12 text-center">
                No active habits.
              </div>
            ) : (
              <div className="space-y-5">
                {perHabit.map(({ habit, done, target, pct }) => (
                  <div key={habit._id}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                          style={{
                            background: `${habit.color}18`,
                            color: habit.color,
                          }}
                        >
                          {habit.icon}
                        </span>

                        <span className="text-sm font-medium truncate">
                          {habit.name}
                        </span>
                      </div>

                      <span className="text-xs text-muted shrink-0">
                        {done}/{target} · {pct}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full overflow-hidden bg-brand-50 dark:bg-brand-500/10">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{
                          width: `${pct}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Streaks */}
      {!!habits.filter((h) => !h.isArchived).length && (
        <section className="rounded-3xl border border-(--divider) bg-(--surface-strong) p-5">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="text-sm font-semibold">Current streaks</div>

              <div className="mt-1 text-xs text-muted">
                Momentum across your active habits
              </div>
            </div>

            <div className="text-xs px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
              {activeStreaks} active
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {habits
              .filter((h) => !h.isArchived)
              .map((h) => {
                const s = streakBoard[h._id];
                const cur = s?.current || 0;

                return (
                  <div
                    key={h._id}
                    className="rounded-2xl border border-(--divider) bg-(--surface) p-3 flex items-center gap-3"
                  >
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{
                        background: `${h.color}18`,
                        color: h.color,
                      }}
                    >
                      {h.icon}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {h.name}
                      </div>

                      <div
                        className={`mt-0.5 text-xs ${
                          cur > 0
                            ? "text-amber-600 dark:text-amber-300"
                            : "text-faint"
                        }`}
                      >
                        {cur > 0
                          ? `${cur} day${cur === 1 ? "" : "s"} streak`
                          : "No active streak"}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}
