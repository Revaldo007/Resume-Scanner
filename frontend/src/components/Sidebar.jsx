import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/jobs", label: "Job Requirements", icon: "📋" },
  { to: "/resumes/upload", label: "Resume Upload", icon: "📤" },
  { to: "/comparison", label: "Candidate Comparison", icon: "⚖️" },
  { to: "/history", label: "Screening History", icon: "🕓" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-xl font-bold text-white">ResuScreen</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-slate-500 border-t border-slate-800">
        Mini Project · NLP Resume Screening
      </div>
    </aside>
  );
}
