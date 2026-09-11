import { ListChecks, Flame, Trophy, TrendingUp } from "lucide-react";

const Card = ({ icon: Icon, label, value, tone = "green" }) => {
  const styles = {
    green:
      "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  };

  return (
    <div className="rounded-2xl border border-(--divider) bg-(--surface-strong) p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          styles[tone]
        }`}
      >
        <Icon size={18} />
      </div>

      <div>
        <div className="text-xs text-muted">{label}</div>
        <div className="text-xl font-semibold mt-0.5">{value}</div>
      </div>
    </div>
  );
};

export default function SummaryCards({
  totalHabits,
  activeStreaks,
  bestStreak,
  weekRate,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card icon={ListChecks} label="Total habits" value={totalHabits} />

      <Card
        icon={Flame}
        label="Active streaks"
        value={activeStreaks}
        tone="amber"
      />

      <Card
        icon={Trophy}
        label="Best streak"
        value={`${bestStreak} days`}
        tone="amber"
      />

      <Card icon={TrendingUp} label="This week" value={`${weekRate}%`} />
    </div>
  );
}
