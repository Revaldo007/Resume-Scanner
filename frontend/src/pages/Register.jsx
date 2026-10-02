import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import AuthCard from "../components/AuthCard";

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

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

// Advisory only: the real rules are still in validate() below.
function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-teal-400", "bg-emerald-400"];

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const score = passwordScore(password);

  const validate = () => {
    const name = username.trim();
    if (!name) return "Username is required.";
    if (name.length < 3) return "Username must be at least 3 characters.";
    if (name.length > 50) return "Username must be 50 characters or fewer.";
    if (!USERNAME_PATTERN.test(name))
      return "Username may only contain letters, numbers, dots, dashes and underscores.";
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (new TextEncoder().encode(password).length > 72)
      return "Password is too long (maximum 72 bytes).";
    if (password !== confirmPassword) return "Passwords do not match.";
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
      await register(username.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-teal-400 underline transition-colors hover:text-teal-300"
          >
            Log in
          </Link>
        </>
      }
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Create your account</h2>
        <p className="mt-0.5 text-xs text-slate-400">Start analysing resumes and shortlisting candidates.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="reg-username" className={labelClass}>
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
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              placeholder="e.g. recruiter_01"
              autoComplete="username"
              autoFocus
              aria-describedby="reg-username-hint"
            />
          </div>
          <p id="reg-username-hint" className="mt-1.5 text-[11px] text-slate-500">
            3 to 50 characters: letters, numbers, dots, dashes, underscores.
          </p>
        </div>

        <div>
          <label htmlFor="reg-password" className={labelClass}>
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
              id="reg-password"
              type={showPasswords ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          {password && (
            <div className="mt-2 flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      n <= score ? STRENGTH_COLORS[score] : "bg-slate-700/70"
                    }`}
                  />
                ))}
              </div>
              <span className="w-14 text-right text-[11px] text-slate-400">{STRENGTH_LABELS[score]}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="reg-confirm" className={labelClass}>
            Confirm password
          </label>
          <div className="group relative">
            <span className={iconClass}>
              <Icon>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </Icon>
            </span>
            <input
              id="reg-confirm"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </div>

          {confirmPassword && (
            <p
              className={`mt-1.5 flex items-center gap-1 text-[11px] ${
                password === confirmPassword ? "text-emerald-400" : "text-red-300"
              }`}
              aria-live="polite"
            >
              {password === confirmPassword ? (
                <>
                  <Icon className="h-3 w-3">
                    <path d="M20 6 9 17l-5-5" />
                  </Icon>
                  Passwords match
                </>
              ) : (
                "Passwords do not match yet"
              )}
            </p>
          )}
        </div>

        <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-slate-400 transition-colors hover:text-slate-300">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="cursor-pointer rounded border-slate-700 bg-[#0d1627] text-teal-500 focus:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400"
          />
          Show passwords
        </label>

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
              Creating account...
            </>
          ) : (
            <>
              Sign up
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