import { useState } from "react";
import { Check } from "lucide-react";
import { CATEGORIES, COLORS, ICONS } from "../utils/constants.js";

export default function HabitForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    category: initial?.category || "Health",
    frequency: initial?.frequency || "daily",
    targetDays: initial?.targetDays || 7,
    color: initial?.color || COLORS[0],
    icon: initial?.icon || ICONS[0],
  });

  const set = (key) => (e) =>
    setForm((current) => ({
      ...current,
      [key]: e?.target ? e.target.value : e,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    onSubmit({
      ...form,
      targetDays: Number(form.targetDays),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity */}
      <section>
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Habit details
          </div>

          <p className="mt-1 text-sm text-muted">
            Give your routine a clear and simple identity.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Habit name</label>

            <input
              className="input"
              placeholder="e.g. Drink 2L of water"
              value={form.name}
              onChange={set("name")}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="label">
              Description
              <span className="ml-1 text-xs font-normal text-faint">
                optional
              </span>
            </label>

            <textarea
              className="input resize-none min-h-88px"
              rows={3}
              placeholder="Why does this habit matter to you?"
              value={form.description}
              onChange={set("description")}
            />
          </div>
        </div>
      </section>

      <div className="border-t border-var(--divider)" />

      {/* Routine */}
      <section>
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Routine
          </div>

          <p className="mt-1 text-sm text-muted">
            Choose how Routiq should organize this habit.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>

            <select
              className="input"
              value={form.category}
              onChange={set("category")}
            >
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Frequency</label>

            <select
              className="input"
              value={form.frequency}
              onChange={set("frequency")}
            >
              <option value="daily">Daily</option>

              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <label className="label mb-0">Weekly target</label>

            <span className="inline-flex items-center rounded-lg bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
              {form.targetDays} {Number(form.targetDays) === 1 ? "day" : "days"}
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={7}
            value={form.targetDays}
            onChange={set("targetDays")}
            className="routiq-range mt-4 w-full"
          />

          <div className="mt-2 flex justify-between text-[10px] text-faint">
            <span>1 day</span>
            <span>7 days</span>
          </div>
        </div>
      </section>

      <div className="border-t border-var(--divider)" />

      {/* Appearance */}
      <section>
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Appearance
          </div>

          <p className="mt-1 text-sm text-muted">
            Make this habit easy to recognize at a glance.
          </p>
        </div>

        {/* Icons */}
        <div>
          <label className="label">Icon</label>

          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {ICONS.map((icon) => {
              const selected = form.icon === icon;

              return (
                <button
                  type="button"
                  key={icon}
                  onClick={() => set("icon")(icon)}
                  className={`aspect-square rounded-xl text-xl flex items-center justify-center border transition ${
                    selected
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 ring-2 ring-brand-500/15"
                      : "border-var(--divider) bg-var(--surface) hover:bg-var(--surface-hover) hover:border-brand-500/20"
                  }`}
                  aria-label={`Select ${icon} icon`}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colors */}
        <div className="mt-5">
          <label className="label">Color</label>

          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((color) => {
              const selected = form.color === color;

              return (
                <button
                  type="button"
                  key={color}
                  onClick={() => set("color")(color)}
                  className={`relative w-9 h-9 rounded-full transition hover:scale-105 ${
                    selected
                      ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-var(--surface-strong)"
                      : ""
                  }`}
                  style={{
                    background: color,
                  }}
                  aria-label={`Select color ${color}`}
                >
                  {selected && (
                    <Check
                      size={15}
                      strokeWidth={3}
                      className="absolute inset-0 m-auto text-white drop-shadow-sm"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="mt-5 rounded-2xl border border-var(--divider) bg-var(--surface) p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted mb-3">
            Preview
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{
                background: `${form.color}18`,
                color: form.color,
              }}
            >
              {form.icon}
            </div>

            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {form.name.trim() || "Your habit"}
              </div>

              <div className="text-xs text-muted mt-0.5">
                {form.category} ·{" "}
                {form.frequency === "daily" ? "Daily" : "Weekly"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting || !form.name.trim()}
        >
          {submitting ? "Saving..." : initial ? "Save changes" : "Create habit"}
        </button>
      </div>
    </form>
  );
}
