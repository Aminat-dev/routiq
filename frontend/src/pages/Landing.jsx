import { Link, Navigate } from "react-router-dom";
import {
  Sparkles,
  Flame,
  BarChart3,
  Brain,
  CheckCircle2,
  ArrowRight,
  Target,
  Activity,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import RoutiqOrbit from "../components/RoutiqOrbit";

// const features = [
//   {
//     icon: CheckCircle2,
//     title: "Track daily habits",
//     desc: "One-click check-offs with progress rings, streaks and a 90-day heatmap.",
//   },
//   {
//     icon: Brain,
//     title: "AI weekly insights",
//     desc: "Personalised reports on what worked, what struggled, and what to try next.",
//   },
//   {
//     icon: Flame,
//     title: "Streak recovery coach",
//     desc: "When streaks break, AI generates a gentle 3-day comeback plan.",
//   },
//   {
//     icon: BarChart3,
//     title: "Beautiful statistics",
//     desc: "See patterns across days, weeks, categories — with an AI chat built-in.",
//   },
// ];

export default function Landing() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-(--divider) bg-(--bg-base)/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-500 to-brand-800 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Target size={20} />
            </div>

            <div className="leading-tight">
              <img
                src="../public/Routiq.png"
                alt="Routiq"
                width="150"
                height="80"
              />
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggle}
              className="btn-ghost p-2.5"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <Link to="/login" className="btn-ghost hidden sm:inline-flex">
              Log in
            </Link>

            <Link to="/register" className="btn-primary">
              Get started
              <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      </header>
      {/* /{hero section} */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 md:pt-20 pb-20">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Hero copy */}
          <div>
            <div className="inline-flex items-center gap-2 chip mb-6 bg-brand-500/10 text-brand-700 dark:text-brand-300">
              <Sparkles size={13} />
              AI-powered personal habit intelligence
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.03]">
              Build routines
              <br />
              that actually{" "}
              <span className="text-brand-600 dark:text-brand-400">last.</span>
            </h1>

            <p className="mt-6 text-soft text-lg md:text-xl leading-relaxed max-w-xl">
              Routiq helps you build better habits, understand your consistency
              patterns, and get personalized AI guidance based on the way you
              actually live.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="btn-primary px-6 py-3.5 text-base"
              >
                Start building habits
                <ArrowRight size={17} />
              </Link>

              <Link to="/login" className="btn-secondary px-6 py-3.5 text-base">
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-600" />
                Track daily progress
              </div>

              <div className="flex items-center gap-2">
                <Brain size={16} className="text-brand-600" />
                AI-powered insights
              </div>

              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-brand-600" />
                Understand your patterns
              </div>
            </div>
          </div>

          {/* Product preview */}

          <div className="relative flex items-center justify-center">
            <RoutiqOrbit />
          </div>
        </div>
      </section>
      {/* how routiq works plus ai intelligence section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-3">
            SIMPLE BY DESIGN
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Better habits, without overthinking them.
          </h2>

          <p className="mt-4 text-soft leading-relaxed">
            Routiq helps you focus on what matters: building consistency,
            understanding your patterns, and improving one day at a time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              number: "01",
              icon: Target,
              title: "Choose your habits",
              text: "Create routines around the things you actually want to improve.",
            },
            {
              number: "02",
              icon: CheckCircle2,
              title: "Show up daily",
              text: "Track progress quickly and keep your routine easy to maintain.",
            },
            {
              number: "03",
              icon: Brain,
              title: "Learn what works",
              text: "Routiq AI finds patterns in your activity and helps you improve.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.number}
                className="group rounded-3xl border border-(--divider) bg-(--surface) p-7 transition hover:-translate-y-1 hover:shadow-(--shadow)"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-700 dark:text-brand-300">
                    <Icon size={20} />
                  </div>

                  <span className="text-xs font-semibold tracking-[0.2em] text-faint">
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-8 text-lg font-semibold">{item.title}</h3>

                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>
      {/* ai section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="rounded-4xl bg-brand-900 text-white overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-10 items-center px-7 py-10 md:px-12 md:py-14 lg:px-16 lg:py-16">
            <div>
              <div className="inline-flex items-center gap-2 text-brand-300 text-sm font-medium mb-5">
                <Sparkles size={15} />
                ROUTIQ AI
              </div>

              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                Your habits tell a story.
                <br />
                Routiq helps you understand it.
              </h2>

              <p className="mt-5 text-brand-100/80 leading-relaxed max-w-lg">
                Instead of showing you numbers alone, Routiq turns your activity
                into useful guidance about consistency, setbacks, and the
                routines that work best for you.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  "Weekly habit summaries",
                  "Consistency patterns",
                  "Streak recovery guidance",
                  "Personalized suggestions",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-brand-50"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-brand-300 shrink-0"
                    />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl bg-white/[0.07] border border-white/10 p-6 backdrop-blur">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-brand-400/15 flex items-center justify-center">
                    <Sparkles size={17} className="text-brand-300" />
                  </div>

                  <div>
                    <div className="text-sm font-medium">Weekly reflection</div>
                    <div className="text-xs text-brand-200/70">
                      Generated from your routine
                    </div>
                  </div>
                </div>

                <p className="text-lg leading-relaxed text-brand-50">
                  You completed your morning habits on 5 of the last 7 days.
                  Your strongest days were Monday through Thursday, while
                  weekends were less consistent.
                </p>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="text-xs uppercase tracking-[0.16em] text-brand-300 mb-2">
                    Suggested adjustment
                  </div>

                  <p className="text-sm leading-relaxed text-brand-100/80">
                    Keep your weekday routine unchanged and reduce your weekend
                    morning routine to one essential habit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* two-column “What Routiq helps you do” section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-20 items-start">
          {/* Left side */}
          <div className="lg:sticky lg:top-28">
            <div className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-3">
              EVERYTHING YOU NEED
            </div>

            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
              More than checking boxes.
            </h2>

            <p className="mt-5 text-soft leading-relaxed max-w-md">
              Routiq helps you understand your habits, recover when you fall
              off, and see whether your routine is actually improving over time.
            </p>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 mt-7 text-sm font-medium text-brand-700 dark:text-brand-300"
            >
              Start your routine
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Right side */}
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: Flame,
                title: "Streaks that motivate",
                text: "See your consistency without turning one missed day into failure.",
              },
              {
                icon: BarChart3,
                title: "Progress you can understand",
                text: "View weekly and monthly patterns instead of staring at raw numbers.",
              },
              {
                icon: Brain,
                title: "AI that notices patterns",
                text: "Get useful observations about when and how you are most consistent.",
              },
              {
                icon: Activity,
                title: "Recover when life happens",
                text: "Routiq helps you adjust and continue instead of starting over.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className={`rounded-3xl border border-(--divider) bg-(--surface) p-6 md:p-7 ${
                    index % 2 === 1 ? "sm:translate-y-8" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-700 dark:text-brand-300">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* social-proof/stat section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="border-y border-(--divider) py-10">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-semibold text-brand-700 dark:text-brand-300">
                Simple
              </div>
              <div className="mt-2 text-sm text-muted">
                Quick daily habit tracking
              </div>
            </div>

            <div>
              <div className="text-2xl font-semibold text-brand-700 dark:text-brand-300">
                Personal
              </div>
              <div className="mt-2 text-sm text-muted">
                Insights based on your own routine
              </div>
            </div>

            <div>
              <div className="text-2xl font-semibold text-brand-700 dark:text-brand-300">
                Adaptive
              </div>
              <div className="mt-2 text-sm text-muted">
                Guidance that changes with your progress
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24">
        <div className="relative overflow-hidden rounded-4xl bg-brand-900 px-7 py-14 md:px-14 md:py-16 text-center text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-500/15 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl" />
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-brand-300 text-sm font-medium mb-4">
              <Sparkles size={15} />
              START SMALL. STAY CONSISTENT.
            </div>

            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
              A better routine can start today.
            </h2>

            <p className="mt-5 text-brand-100/80 leading-relaxed max-w-xl mx-auto">
              Create your first habit, build consistency, and let Routiq help
              you understand what keeps you moving forward.
            </p>

            <Link
              to="/register"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-900 px-6 py-3.5 text-sm font-semibold transition hover:bg-brand-50"
            >
              Get started free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      {/* footer */}
      <footer className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
        <div className="border-t border-(--divider) pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div>
            <img
              src="../public/Routiq.png"
              alt="routiq"
              width={100}
              height={100}
            />
          </div>

          <div>Plan today. A better you tomorrow.</div>

          <div>© {new Date().getFullYear()} Routiq</div>
        </div>
      </footer>
    </div>
  );
}
