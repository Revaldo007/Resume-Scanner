import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">
          Resume Screening System
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">
          Signed in as <span className="font-medium text-slate-700">{user?.username || "..."}</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
