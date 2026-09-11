import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Sparkles, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (form.password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setErr(e.response?.data?.message || "Registration failed");
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
            YOUR ROUTINE STARTS HERE
          </div>

          <h1 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-tight">
            Build better days,
            <br />
            one habit at a time.
          </h1>

          <p className="mt-5 text-brand-100/75 leading-relaxed max-w-md">
            Create routines that fit your life and let Routiq help you turn
            daily actions into long-term progress.
          </p>
        </div>

        <div className="relative text-sm text-brand-200/60">
          Plan today. A better you tomorrow.
        </div>
      </div>

      {/* Registration form */}
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
          <Link to="/" className="relative flex items-center gap-3 w-fit">
            <img
              src="../public/Routiq.png"
              alt="Routiq"
              width="150"
              height="80"
            />
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">
              Create your account
            </h2>

            <p className="mt-2 text-soft">
              Start building a routine that works for you.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Your name</label>

              <input
                className="input"
                value={form.name}
                onChange={set("name")}
                placeholder="Enter your name"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Email address</label>

              <input
                className="input"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>

              <input
                className="input"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="At least 6 characters"
                required
              />

              <p className="mt-2 text-xs text-muted">
                Use at least 6 characters.
              </p>
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-soft">
            Already have a Routiq account?{" "}
            <Link
              to="/login"
              className="text-brand-700 dark:text-brand-300 font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
