import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import AuthCard from "../components/AuthCard";

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Mirrors the rules enforced by the backend so users get instant feedback
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

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <AuthCard
      title="Create your account"
      subtitle="Register to start screening resumes"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="reg-username" className="block text-sm font-medium text-slate-700 mb-1">
            Username
          </label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
            placeholder="e.g. recruiter_01"
            autoComplete="username"
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
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
        <div>
          <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 mb-1">
            Confirm password
          </label>
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

        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
          />
          Show passwords
        </label>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </AuthCard>
  );
}
