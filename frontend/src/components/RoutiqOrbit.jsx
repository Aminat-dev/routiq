import { BookOpen, Dumbbell, Droplets, Moon, Sparkles } from "lucide-react";

const habits = [
  {
    icon: <Droplets size={18} />,
    label: "Hydration",
    className: "habit-node node-1",
  },
  {
    icon: <BookOpen size={18} />,
    label: "Reading",
    className: "habit-node node-2",
  },
  {
    icon: <Dumbbell size={18} />,
    label: "Exercise",
    className: "habit-node node-3",
  },
  {
    icon: <Moon size={18} />,
    label: "Sleep",
    className: "habit-node node-4",
  },
];

export default function RoutiqOrbit() {
  return (
    <div className="routiq-orbit-wrapper">
      <div className="routiq-glow" />

      <div className="orbit-ring orbit-ring-1" />
      <div className="orbit-ring orbit-ring-2" />
      <div className="orbit-ring orbit-ring-3" />

      <div className="orbit-center">
        <div className="orbit-logo">
          <img src="../public/favicon.png" alt="R" width="70" height="70" />
        </div>

        <div className="orbit-ai-badge">
          <Sparkles size={13} />
          AI
        </div>
      </div>

      {habits.map((habit) => (
        <div key={habit.label} className={habit.className}>
          <div className="habit-node-icon">{habit.icon}</div>

          <span>{habit.label}</span>
        </div>
      ))}

      <div className="orbit-dot orbit-dot-1" />
      <div className="orbit-dot orbit-dot-2" />
      <div className="orbit-dot orbit-dot-3" />
    </div>
  );
}
