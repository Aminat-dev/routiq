import { Check, Flame, Pencil, Trash2, Archive } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function TodayHabitCard({
  habit,
  completed,
  onToggle,
  streak = 0,
  onEdit,
  onDelete,
  onArchive,
}) {
  const [menu, setMenu] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuWidth = 160; // matches w-40
  const menuHeight = 132; // approx for 3 items

  useLayoutEffect(() => {
    if (!menu || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const flipUp = rect.bottom + menuHeight + 8 > window.innerHeight;
    setPos({
      top: flipUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.right - menuWidth,
    });
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  return (
    <div
      className={`group rounded-2xl border p-3.5 flex items-center gap-3 transition ${
        completed
          ? "border-brand-500/20 bg-brand-50/60 dark:bg-brand-500/6"
          : "border-(--divider) bg-(--surface) hover:bg-(--surface-hover)"
      }`}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{
          background: `${habit.color}18`,
          color: habit.color,
        }}
      >
        {habit.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div
            className={`font-medium truncate ${completed ? "text-soft" : ""}`}
          >
            {habit.name}
          </div>

          <span className="hidden sm:inline-flex text-[10px] px-2 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
            {habit.category}
          </span>
        </div>

        {habit.description && (
          <div className="text-xs text-muted truncate mt-1">
            {habit.description}
          </div>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-1 text-xs text-muted">
        <Flame
          size={14}
          className={streak > 0 ? "text-amber-500" : "text-faint"}
        />
        <span>{streak}</span>
      </div>

      <div className="relative">
        <button
          ref={triggerRef}
          className="btn-ghost p-2"
          onClick={() => setMenu((m) => !m)}
          aria-label="Habit options"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="13" cy="8" r="1.5" />
          </svg>
        </button>

        {menu &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-100"
                onClick={() => setMenu(false)}
              />

              <div
                className="fixed z-110 rounded-xl border border-(--divider) bg-(--surface-strong) py-1 w-40 shadow-xl animate-fade-in"
                style={{ top: pos.top, left: pos.left }}
              >
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-soft hover:bg-(--surface-hover)"
                  onClick={() => {
                    setMenu(false);
                    onEdit();
                  }}
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-soft hover:bg-(--surface-hover)"
                  onClick={() => {
                    setMenu(false);
                    onArchive();
                  }}
                >
                  <Archive size={14} />

                  {habit.isArchived ? "Unarchive" : "Archive"}
                </button>

                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10"
                  onClick={() => {
                    setMenu(false);
                    onDelete();
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>,
            document.body,
          )}
      </div>

      <button
        onClick={onToggle}
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition ${
          completed
            ? "bg-brand-600 text-white shadow-sm animate-pop"
            : "border-2 border-(--divider) text-faint hover:border-brand-400 hover:text-brand-600"
        }`}
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
      >
        {completed && <Check size={18} strokeWidth={3} />}
      </button>
    </div>
  );
}
