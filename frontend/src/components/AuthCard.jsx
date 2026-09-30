import { Link, useLocation } from "react-router-dom";

// Shared dark cyber-emerald & midnight teal layout for Fathima.A's Resume Screening System
export default function AuthCard({ children, footer }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start pt-8 sm:pt-12 md:pt-14 pb-16 bg-[#050a14] px-4 overflow-x-hidden selection:bg-teal-500 selection:text-white">
      {/* High-tech ambient background glow and mesh */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-cyan-600/15 via-teal-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-950/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-cyan-950/25 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Header Title */}
      <div className="text-center mb-10 sm:mb-14 px-4 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Web-Based Resume Analysis and{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Intelligent Candidate Screening System
          </span>
        </h1>
        {/* Cyber Cyan to Emerald accent divider pill */}
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 rounded-full mx-auto mt-4 shadow-sm shadow-teal-500/50" />
      </div>

      {/* Animated Cartoon GIF Emblem */}
      <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
        <div className="absolute w-36 h-36 bg-gradient-to-tr from-cyan-500/35 via-teal-500/25 to-emerald-500/35 rounded-full blur-2xl pointer-events-none" />
        <img
          src="/Headphone%20with%20blueberry%20cartoon.gif"
          alt="Avatar Emblem"
          className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain drop-shadow-[0_0_20px_rgba(20,184,166,0.5)]"
        />
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md bg-[#0b1322]/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 shadow-cyan-950/40 hover:border-cyan-900/50 transition-colors">
        {/* Dual Tab Switch: Log in / Sign up */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0d1627] rounded-xl mb-6 border border-slate-800/90">
          <Link
            to="/login"
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              isLogin
                ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Log in
          </Link>
          <Link
            to="/register"
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              !isLogin
                ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Sign up
          </Link>
        </div>

        {children}
      </div>

      {/* Footer navigation link */}
      {footer && (
        <div className="text-center text-xs sm:text-sm text-slate-400 mt-6 relative z-10">
          {footer}
        </div>
      )}

      {/* Floating Bottom-Right Project & Guidance Badge */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-30 bg-[#091222]/95 backdrop-blur-md border border-cyan-900/60 rounded-2xl px-5 py-3 shadow-2xl text-right transition-transform hover:scale-105 pointer-events-auto shadow-cyan-950/40">
        <div className="text-sm font-bold text-slate-100 tracking-wide">
          Fathima.A
        </div>
        <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
          GUIDANCE BY
        </div>
        <div className="text-xs font-semibold text-emerald-400 mt-0.5">
          Jeba Malar (HOD)
        </div>
      </div>
    </div>
  );
}
