import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTheme } from "../context/ThemeContext.jsx";

export default function MonthlyBarChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const grid = isDark ? "rgba(255,255,255,0.08)" : "rgba(6,78,59,0.08)";

  const tick = isDark ? "#9CA3AF" : "#6B7280";

  const total = data?.reduce((sum, item) => sum + item.count, 0);

  const tooltipStyle = {
    background: isDark ? "rgba(7,23,17,0.96)" : "rgba(255,255,255,0.97)",
    border: `1px solid ${
      isDark ? "rgba(167,243,208,0.10)" : "rgba(6,78,59,0.10)"
    }`,
    borderRadius: 12,
    fontSize: 12,
    color: isDark ? "#F3F4F6" : "#111827",
  };

  return (
    <div className="rounded-3xl border border-[var(--divider)] bg-[var(--surface-strong)] p-5">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="text-sm font-semibold">Last 30 days</div>

          <div className="mt-1 text-xs text-muted">
            Your longer-term activity pattern
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-semibold">{total || 0}</div>

          <div className="text-[10px] text-muted">total</div>
        </div>
      </div>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 4,
              right: 4,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="routiqMonthlyBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={grid}
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{
                fontSize: 10,
                fill: tick,
              }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />

            <YAxis
              tick={{
                fontSize: 11,
                fill: tick,
              }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />

            <Tooltip
              cursor={{
                fill: isDark
                  ? "rgba(255,255,255,0.035)"
                  : "rgba(16,185,129,0.045)",
              }}
              contentStyle={tooltipStyle}
            />

            <Bar
              dataKey="count"
              fill="url(#routiqMonthlyBar)"
              radius={[5, 5, 0, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
