import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  CalendarDays,
  Brain,
  BarChart3,
  Sparkles,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/habits", label: "Habits", icon: ListChecks },
  { to: "/weekly", label: "Weekly", icon: CalendarDays },
  { to: "/insights", label: "Insights", icon: Brain },
  { to: "/stats", label: "Stats", icon: BarChart3 },
];

export default function MobileNav() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-[var(--bg-base)]/90 backdrop-blur-xl border-b border-[var(--divider)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-800 text-white flex items-center justify-center">
            <Sparkles size={15} />
          </div>

          <span className="font-semibold tracking-tight">Routiq</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-soft hover:bg-[var(--surface-hover)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="w-8 h-8 rounded-full bg-brand-700 text-white text-sm font-semibold flex items-center justify-center">
            {user?.avatar || user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-soft hover:bg-[var(--surface-hover)]"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--surface-strong)]/95 backdrop-blur-xl border-t border-[var(--divider)] px-2 py-2">
        <div className="grid grid-cols-5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-medium transition ${
                  isActive ? "text-brand-700 dark:text-brand-300" : "text-faint"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                      isActive ? "bg-brand-50 dark:bg-brand-500/10" : ""
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
