import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const { theme, toggle } = useTheme();
  const loc = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(loc.state?.from || "/dashboard", { replace: true });
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-brand-900 text-white p-12 xl:p-16 flex-col justify-between">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <Link to="/" className="relative flex items-center gap-3 w-fit">
          <img
            src="../public/Routiq.png"
            alt="Routiq"
            width="150"
            height="80"
          />
        </Link>

        <div className="relative max-w-lg">
          <div className="inline-flex items-center gap-2 text-brand-300 text-sm font-medium mb-5">
            <Sparkles size={14} />
            BUILD CONSISTENCY THAT LASTS
          </div>

          <h1 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-tight">
            Small routines.
            <br />
            Meaningful progress.
          </h1>

          <p className="mt-5 text-brand-100/75 leading-relaxed max-w-md">
            Come back to your habits, understand your patterns, and keep
            building momentum one day at a time.
          </p>
        </div>

        <div className="relative text-sm text-brand-200/60">
          Plan today. A better you tomorrow.
        </div>
      </div>

      {/* Login form */}
      <div className="relative flex items-center justify-center px-6 py-12 md:px-10">
        <button
          onClick={toggle}
          className="absolute top-6 right-6 btn-ghost p-2.5"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link
            to="/"
            className="lg:hidden flex items-center gap-3 mb-10 w-fit"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-500 to-brand-800 text-white flex items-center justify-center">
              <Sparkles size={18} />
            </div>

            <span className="font-semibold text-xl">Routiq</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">
              Welcome back
            </h2>

            <p className="mt-2 text-soft">
              Sign in and continue building your routine.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email address</label>

              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label">Password</label>

                <span className="text-xs text-muted">Keep it secure</span>
              </div>

              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {err && (
              <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/15 rounded-xl px-4 py-3">
                {err}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3.5"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-soft">
            New to Routiq?{" "}
            <Link
              to="/register"
              className="text-brand-700 dark:text-brand-300 font-medium hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
