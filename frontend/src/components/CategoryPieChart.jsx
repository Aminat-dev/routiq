import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTheme } from "../context/ThemeContext.jsx";

const COLORS = [
  "#059669",
  "#10B981",
  "#34D399",
  "#047857",
  "#0F766E",
  "#84CC16",
  "#F59E0B",
  "#D97706",
  "#6B7280",
];

export default function CategoryPieChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0;

  return (
    <div className="rounded-3xl border border-[var(--divider)] bg-[var(--surface-strong)] p-5">
      <div className="mb-3">
        <div className="text-sm font-semibold">Completions by category</div>

        <div className="mt-1 text-xs text-muted">
          Where your habit activity is concentrated
        </div>
      </div>

      {!data?.length ? (
        <div className="py-16 text-center">
          <div className="text-sm font-medium">No category activity yet</div>

          <p className="mt-1 text-xs text-muted">
            Completed habits will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="relative">
            <div
              style={{
                width: "100%",
                height: 250,
              }}
            >
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke={isDark ? "#071711" : "#FFFFFF"}
                    strokeWidth={3}
                  >
                    {data.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: isDark
                        ? "rgba(7,23,17,0.96)"
                        : "rgba(255,255,255,0.97)",
                      border: `1px solid ${
                        isDark ? "rgba(167,243,208,0.10)" : "rgba(6,78,59,0.10)"
                      }`,
                      borderRadius: 12,
                      fontSize: 12,
                      color: isDark ? "#F3F4F6" : "#111827",
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: 11,
                      color: isDark ? "#D1D5DB" : "#4B5563",
                    }}
                    iconType="circle"
                    iconSize={7}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-8">
              <div className="text-center">
                <div className="text-xl font-semibold">{total}</div>

                <div className="text-[10px] text-muted">completions</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
