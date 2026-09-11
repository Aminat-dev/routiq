import { useEffect, useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";
import HabitForm from "../components/HabitForm.jsx";
import TodayHabitCard from "../components/TodayHabitCard.jsx";
import WeeklyGrid from "../components/WeeklyGrid.jsx";
import HeatmapChart from "../components/HeatmapChart.jsx";
import SummaryCards from "../components/SummaryCards.jsx";
import AIWeeklyReport from "../components/AIWeeklyReport.jsx";
import MorningMotivation from "../components/MorningMotivation.jsx";
import HabitSuggestionModal from "../components/HabitSuggestionModal.jsx";
import StreakRecoveryCard from "../components/StreakRecoveryCard.jsx";
import ProgressRing from "../components/ProgressRing.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { celebrate, celebrateBig } from "../utils/confetti.js";
import { streakFromKeys, todayKey, weekKeys } from "../utils/dateHelpers.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [weekLogs, setWeekLogs] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [allLogsByHabit, setAllLogsByHabit] = useState({});
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [recoveryHabit, setRecoveryHabit] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const week = weekKeys();
      const start = week[0].key;
      const end = week[week.length - 1].key;

      const [habitsRes, todayRes, rangeRes, heatRes] = await Promise.all([
        api.get("/habits"),
        api.get("/logs/today"),
        api.get("/logs/range", { params: { start, end } }),
        api.get("/logs/heatmap"),
      ]);

      setHabits(habitsRes.data);
      setTodayLogs(todayRes.data);
      setWeekLogs(rangeRes.data);
      setHeatmap(heatRes.data);

      const byId = {};
      const start90 = new Date();
      start90.setDate(start90.getDate() - 89);
      const s90 = start90.toISOString().slice(0, 10);
      const e90 = new Date().toISOString().slice(0, 10);
      const allRange = await api.get("/logs/range", {
        params: { start: s90, end: e90 },
      });
      for (const h of habitsRes.data) byId[h._id] = [];
      for (const l of allRange.data) {
        if (!byId[l.habitId]) byId[l.habitId] = [];
        byId[l.habitId].push(l.completedDate);
      }
      for (const k of Object.keys(byId)) byId[k] = byId[k].sort().reverse();
      setAllLogsByHabit(byId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const completedToday = useMemo(
    () => new Set(todayLogs.map((l) => String(l.habitId))),
    [todayLogs],
  );

  const weekLogsByHabit = useMemo(() => {
    const out = {};
    for (const l of weekLogs) {
      if (!out[l.habitId]) out[l.habitId] = [];
      out[l.habitId].push(l.completedDate);
    }
    return out;
  }, [weekLogs]);

  const streaksById = useMemo(() => {
    const out = {};
    for (const h of habits) {
      out[h._id] = streakFromKeys(allLogsByHabit[h._id] || []);
    }
    return out;
  }, [habits, allLogsByHabit]);

  const todayProgress = habits.length
    ? Math.round((completedToday.size / habits.length) * 100)
    : 0;

  const activeStreaks = Object.values(streaksById).filter(
    (s) => s.current > 0,
  ).length;
  const bestStreak = Math.max(
    0,
    ...Object.values(streaksById).map((s) => s.longest),
  );

  const weekTotal = habits.length * 7;
  const weekDone = Object.values(weekLogsByHabit).reduce(
    (s, arr) => s + arr.length,
    0,
  );
  const weekRate = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;

  // Recovery candidates — habits whose longest streak was >= 7 and current is 0
  useEffect(() => {
    if (recoveryHabit) return;
    if (!habits.length) return;
    const dismissed = JSON.parse(
      localStorage.getItem("recovery-dismissed") || "{}",
    );
    for (const h of habits) {
      const s = streaksById[h._id];
      if (!s) continue;
      if (s.longest >= 7 && s.current === 0 && !dismissed[h._id]) {
        setRecoveryHabit(h);
        return;
      }
    }
  }, [habits, streaksById, recoveryHabit]);

  const toggle = async (habit) => {
    const done = completedToday.has(String(habit._id));
    const today = todayKey();
    if (done) {
      await api.delete("/logs", {
        data: { habitId: habit._id, date: today },
      });
      setTodayLogs((logs) =>
        logs.filter((l) => String(l.habitId) !== String(habit._id)),
      );
      setAllLogsByHabit((prev) => {
        const next = { ...prev };
        next[habit._id] = (next[habit._id] || []).filter((d) => d !== today);
        return next;
      });
    } else {
      const res = await api.post("/logs", { habitId: habit._id, date: today });
      setTodayLogs((logs) => [...logs, res.data]);
      setAllLogsByHabit((prev) => {
        const next = { ...prev };
        next[habit._id] = [today, ...(next[habit._id] || [])];
        return next;
      });
      celebrate();
      // Trigger big celebration if this completes all today's habits
      setTimeout(() => {
        const nextDone = completedToday.size + 1;
        if (nextDone === habits.length && habits.length > 0) {
          celebrateBig();
        }
      }, 150);
    }
  };

  const saveHabit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        const res = await api.put(`/habits/${editing._id}`, data);
        setHabits((hs) =>
          hs.map((h) => (h._id === res.data._id ? res.data : h)),
        );
      } else {
        const res = await api.post("/habits", data);
        setHabits((hs) => [...hs, res.data]);
        setAllLogsByHabit((p) => ({ ...p, [res.data._id]: [] }));
      }
      setFormOpen(false);
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteHabit = async (habit) => {
    await api.delete(`/habits/${habit._id}`);
    setHabits((hs) => hs.filter((h) => h._id !== habit._id));
    setTodayLogs((ls) =>
      ls.filter((l) => String(l.habitId) !== String(habit._id)),
    );
    setAllLogsByHabit((prev) => {
      const next = { ...prev };
      delete next[habit._id];
      return next;
    });
    setDeleteTarget(null);
  };

  const archiveHabit = async (habit) => {
    const res = await api.put(`/habits/${habit._id}/archive`);
    if (res.data.isArchived)
      setHabits((hs) => hs.filter((h) => h._id !== habit._id));
    else
      setHabits((hs) => hs.map((h) => (h._id === res.data._id ? res.data : h)));
  };

  const acceptSuggestion = async (s) => {
    const res = await api.post("/habits", {
      name: s.name,
      description: s.description,
      category: s.category,
      frequency: s.frequency,
      icon: s.icon,
      targetDays: s.frequency === "daily" ? 7 : 3,
    });
    setHabits((hs) => [...hs, res.data]);
    setAllLogsByHabit((p) => ({ ...p, [res.data._id]: [] }));
  };

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm text-muted">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>

          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
            Good to see you, {user?.name?.split(" ")[0]}.
          </h1>

          <p className="mt-2 text-sm text-soft">
            Keep today simple. Focus on the habits that matter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-secondary"
            onClick={() => setSuggestOpen(true)}
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">Ask Routiq</span>
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={15} />
            New habit
          </button>
        </div>
      </div>

      {/* AI morning motivation */}
      <MorningMotivation />

      {/* Streak recovery */}
      {recoveryHabit && (
        <StreakRecoveryCard
          habit={recoveryHabit}
          onDismiss={() => {
            const dismissed = JSON.parse(
              localStorage.getItem("recovery-dismissed") || "{}",
            );

            dismissed[recoveryHabit._id] = Date.now();

            localStorage.setItem(
              "recovery-dismissed",
              JSON.stringify(dismissed),
            );

            setRecoveryHabit(null);
          }}
        />
      )}

      {/* Summary */}
      <SummaryCards
        totalHabits={habits.length}
        activeStreaks={activeStreaks}
        bestStreak={bestStreak}
        weekRate={weekRate}
      />

      {/* Main dashboard area */}
      <div className="grid xl:grid-cols-[1.35fr_0.65fr] gap-6 items-start">
        {/* Today's habits */}
        <section className="rounded-3xl border border-[var(--divider)] bg-[var(--surface-strong)] p-5 md:p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Today
              </div>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Your habits
              </h2>

              <p className="text-sm text-muted mt-1">
                {completedToday.size} of {habits.length} completed
              </p>
            </div>

            <div className="relative shrink-0">
              <ProgressRing value={todayProgress} size={58} stroke={5} />

              <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                {todayProgress}%
              </div>
            </div>
          </div>

          {habits.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 flex items-center justify-center mx-auto mb-4">
                <Plus size={22} />
              </div>

              <h3 className="font-medium">Create your first habit</h3>

              <p className="text-sm text-muted mt-2 max-w-sm mx-auto">
                Start with something small and realistic. Consistency matters
                more than intensity.
              </p>

              <button
                className="btn-primary mt-5"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={14} />
                Add habit
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {habits.map((h) => (
                <TodayHabitCard
                  key={h._id}
                  habit={h}
                  completed={completedToday.has(String(h._id))}
                  streak={streaksById[h._id]?.current || 0}
                  onToggle={() => toggle(h)}
                  onEdit={() => {
                    setEditing(h);
                    setFormOpen(true);
                  }}
                  onArchive={() => archiveHabit(h)}
                  onDelete={() => setDeleteTarget(h)}
                />
              ))}
            </div>
          )}
        </section>

        {/* AI weekly report */}
        <div className="xl:sticky xl:top-6">
          <AIWeeklyReport />
        </div>
      </div>

      {/* Progress overview */}
      <section>
        <div className="mb-4">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Progress
          </div>

          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Your week at a glance
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <WeeklyGrid habits={habits} logsByHabit={weekLogsByHabit} />
          </div>

          <div className="lg:col-span-4">
            <HeatmapChart data={heatmap} />
          </div>
        </div>
      </section>

      {/* Habit form modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit habit" : "New habit"}
      >
        <HabitForm
          initial={editing}
          submitting={submitting}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={saveHabit}
        />
      </Modal>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete habit?"
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-soft">
          This will permanently delete <b>{deleteTarget?.name}</b> and all its
          history. This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            className="btn-secondary"
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </button>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 transition"
            onClick={() => deleteHabit(deleteTarget)}
          >
            Delete
          </button>
        </div>
      </Modal>

      <HabitSuggestionModal
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        onAccept={acceptSuggestion}
      />
    </div>
  );
}
