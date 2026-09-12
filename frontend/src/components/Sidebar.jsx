import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  CalendarDays,
  Brain,
  BarChart3,
  LogOut,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Modal from "./Modal.jsx";
import api from "../api/axios.js";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/habits", label: "Habits", icon: ListChecks },
  { to: "/weekly", label: "Weekly", icon: CalendarDays },
  { to: "/insights", label: "Insights", icon: Brain },
  { to: "/stats", label: "Statistics", icon: BarChart3 },
];

export default function Sidebar() {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggle } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [morning, setMorning] = useState(user?.morningMotivation || false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put("/auth/profile", {
        name,
        morningMotivation: morning,
      });
      updateUser(res.data.user);
      setSettingsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 fixed inset-y-0 left-0 z-30 bg-[var(--surface-strong)] border-r border-[var(--divider)]">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[var(--divider)]">
        <div className="flex items-center gap-3">
          <div>
            <img
              src="../public/Routiq.png"
              alt="Routiq"
              width="150"
              height="80"
            />

            <div className="text-[10px] tracking-[0.16em] text-faint">
              BUILD BETTER ROUTINES
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-brand-50 dark:bg-brand-500/10 text-brand-800 dark:text-brand-300"
                  : "text-soft hover:bg-[var(--surface-hover)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                    isActive ? "bg-brand-600 text-white" : "text-muted"
                  }`}
                >
                  <Icon size={17} />
                </div>

                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="p-3 border-t border-[var(--divider)] space-y-1">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-soft hover:bg-[var(--surface-hover)] transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-soft hover:bg-[var(--surface-hover)] transition"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={18} />
          Settings
        </button>

        <div className="mt-2 rounded-2xl bg-brand-50/70 dark:bg-brand-500/10 p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-700 text-white font-semibold flex items-center justify-center">
            {user?.avatar || user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>

            <div className="text-xs text-faint truncate">{user?.email}</div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-lg text-soft hover:bg-white/60 dark:hover:bg-white/5 transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Display name</label>

            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-[var(--divider)] cursor-pointer hover:bg-[var(--surface-hover)]">
            <input
              type="checkbox"
              checked={morning}
              onChange={(e) => setMorning(e.target.checked)}
              className="mt-1 accent-brand-600"
            />

            <div>
              <div className="text-sm font-medium">Morning motivation</div>

              <div className="text-xs text-faint mt-1">
                Show a short personalised AI message every morning on the
                dashboard.
              </div>
            </div>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              className="btn-secondary"
              onClick={() => setSettingsOpen(false)}
            >
              Cancel
            </button>

            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
