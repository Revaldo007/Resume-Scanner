import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import AuthCard from "../components/AuthCard";

function Icon({ children, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const iconClass =
  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400";

const inputClass =
  "w-full rounded-xl border border-slate-700/80 bg-[#0d1627] py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder-slate-500 transition hover:border-slate-600 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:shadow-[0_0_18px_rgba(45,212,191,0.12)]";

const labelClass = "mb-1.5 block text-xs font-medium text-slate-300";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const validate = () => {
    if (!username.trim()) return "Username is required.";
    if (!password) return "Password is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      footer={
        <>
          New here?{" "}
          <Link
            to="/register"
            className="font-medium text-teal-400 underline transition-colors hover:text-teal-300"
          >
            Create an account
          </Link>
        </>
      }
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Welcome back</h2>
        <p className="mt-0.5 text-xs text-slate-400">Log in to screen candidates and review resume analysis.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className={labelClass}>
            Username
          </label>
          <div className="group relative">
            <span className={iconClass}>
              <Icon>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </Icon>
            </span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              placeholder="Your username"
              autoComplete="username"
              autoFocus
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <div className="group relative">
            <span className={iconClass}>
              <Icon>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </Icon>
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-11`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-xl text-slate-500 transition-colors hover:text-teal-300 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Icon>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </Icon>
              ) : (
                <Icon>
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </Icon>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-800/60 bg-red-950/60 px-3.5 py-2.5 text-sm text-red-300"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </Icon>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-700/30 transition-all hover:-translate-y-px hover:from-cyan-500 hover:to-emerald-500 hover:shadow-teal-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transition-none"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              Log in
              <Icon className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </Icon>
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}