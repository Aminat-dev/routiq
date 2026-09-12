import { Flame, Trophy, Target } from "lucide-react";

export default function HabitStatsCard({ stat }) {
  const completionPct = Math.min(
    100,
    Math.round((stat.completions30d / 30) * 100),
  );

  return (
    <div className="rounded-2xl border border-var(--divider) bg-var(--surface-strong) p-4 transition hover:border-brand-500/20">
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{
            background: `${stat.color}18`,
            color: stat.color,
          }}
        >
          {stat.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{stat.name}</div>

          <div className="mt-1 text-xs text-muted">{stat.category}</div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-sm font-semibold">{completionPct}%</div>

          <div className="text-[10px] text-muted">30 days</div>
        </div>
      </div>

      <div className="mt-4 h-1.5 rounded-full overflow-hidden bg-brand-50 dark:bg-brand-500/10">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{
            width: `${completionPct}%`,
          }}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-var(--divider) grid grid-cols-3 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Flame
              size={13}
              className={
                stat.currentStreak > 0 ? "text-amber-500" : "text-faint"
              }
            />
            Current
          </div>

          <div className="mt-1 text-sm font-semibold">
            {stat.currentStreak}
            <span className="ml-1 text-xs font-normal text-muted">days</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Trophy size={13} className="text-amber-500" />
            Best
          </div>

          <div className="mt-1 text-sm font-semibold">
            {stat.longestStreak}
            <span className="ml-1 text-xs font-normal text-muted">days</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Target size={13} className="text-brand-600 dark:text-brand-300" />
            Completed
          </div>

          <div className="mt-1 text-sm font-semibold">
            {stat.completions30d}
            <span className="ml-1 text-xs font-normal text-muted">/30</span>
          </div>
        </div>
      </div>
    </div>
  );
}
