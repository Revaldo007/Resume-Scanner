import { Link, useLocation } from "react-router-dom";
import ResumeLottie from "./ResumeLottie";

/*
  Fit-to-screen layout (no visible scrollbar on laptops and desktops).
  - From 1024px wide, the page is exactly one screen tall.
  - Sizes use vh, so on a shorter window the emblem, spacing, inputs and badge
    shrink a little instead of making the page scroll.
  - On very short windows the emblem is dropped so the form is never squeezed.
  - Below 1024px (phones, tablets) the page scrolls normally.
*/
const css = `
  .auth-root { min-height: 100vh; min-height: 100dvh; }
  .auth-emblem { width: clamp(3.5rem, 12vh, 8rem); height: clamp(3.5rem, 12vh, 8rem); }
  .auth-emblem-glow { width: clamp(4.5rem, 15vh, 9rem); height: clamp(4.5rem, 15vh, 9rem); }

  @media (min-width: 1024px) {
    .auth-root {
      height: 100vh;
      height: 100dvh;
      min-height: 0;
      overflow-y: auto;          /* only used on tiny windows, scrollbar stays hidden */
      scrollbar-width: none;
    }
    .auth-root::-webkit-scrollbar { display: none; }
    body:has(.auth-root) { overflow: hidden; }
  }

  /* Shorter laptop screens: tighten the form card (works for Login and Register) */
  @media (min-width: 1024px) and (max-height: 820px) {
    .auth-tabs { margin-bottom: 0.75rem !important; }
    .auth-card .mb-5 { margin-bottom: 0.75rem !important; }
    .auth-card form > :not([hidden]) ~ :not([hidden]) { margin-top: 0.7rem !important; }
    .auth-card form label[for] { margin-bottom: 0.25rem !important; }
    .auth-card form input:not([type="checkbox"]) {
      padding-top: 0.45rem !important;
      padding-bottom: 0.45rem !important;
    }
    .auth-card form button[type="submit"] {
      margin-top: 0.7rem !important;
      padding-top: 0.5rem !important;
      padding-bottom: 0.5rem !important;
    }
    .auth-badge { padding: 0.6rem 1rem !important; }
    .auth-badge .auth-badge-gap { margin-top: 0.5rem !important; }
  }

  @media (min-width: 1024px) and (max-height: 760px) {
    #reg-username-hint { display: none; }
  }

  /* Very short windows: drop the decorative emblem so the form is never squeezed */
  @media (min-width: 1024px) and (max-height: 600px) {
    .auth-emblem-wrap { display: none; }
  }
`;

// Shared dark cyber-emerald & midnight teal layout for Fathima.A's Resume Screening System
export default function AuthCard({ children, footer }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className="auth-root relative flex flex-col items-center justify-start bg-[#050a14] px-4 pb-16 pt-8 selection:bg-teal-500 selection:text-white overflow-x-hidden sm:pt-12 lg:pb-4 lg:pt-[clamp(0.75rem,3.5vh,3.5rem)]">
      <style>{css}</style>

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
      <div className="mx-auto mb-6 w-full max-w-6xl px-4 text-center lg:mb-[clamp(0.5rem,3vh,2.5rem)]">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight whitespace-normal md:whitespace-nowrap">
          Web-Based Resume Analysis and{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Intelligent Candidate Screening System
          </span>
        </h1>
        {/* Cyber Cyan to Emerald accent divider pill */}
        <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 shadow-sm shadow-teal-500/50 lg:mt-[clamp(0.5rem,1.5vh,1rem)]" />
      </div>

      {/* Center Column: Avatar Emblem + Login/Register Form Card */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4">
        {/* Animated Cartoon GIF Emblem */}
        <div className="auth-emblem-wrap relative mb-5 flex items-center justify-center lg:mb-[clamp(0.5rem,2vh,1.5rem)]">
          <div className="auth-emblem-glow absolute rounded-full bg-gradient-to-tr from-cyan-500/35 via-teal-500/25 to-emerald-500/35 blur-2xl pointer-events-none" />
          <img
            src="/Headphone%20with%20blueberry%20cartoon.gif"
            alt="Avatar Emblem"
            className="auth-emblem relative object-contain drop-shadow-[0_0_20px_rgba(20,184,166,0.5)]"
          />
        </div>

        {/* Card Container wrapper with Left-docked Lottie directly aligned with the Form Card */}
        <div className="relative w-full">
          {/* Left Side: Lottie Resume Animation docked 32px to the left of the Form Card */}
          <div className="hidden min-[1180px]:flex absolute right-[calc(100%+32px)] top-1/2 -translate-y-1/2 pointer-events-none">
            <ResumeLottie />
          </div>

          {/* Form Card */}
          <div className="auth-card relative z-10 w-full rounded-2xl border border-slate-800/90 bg-[#0b1322]/90 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl transition-colors hover:border-cyan-900/50 sm:p-8 lg:p-[clamp(1rem,3.5vh,2rem)]">
            {/* Dual Tab Switch: Log in / Sign up */}
            <div className="auth-tabs mb-6 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-800/90 bg-[#0d1627] p-1">
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
        </div>

        {/* Footer navigation link */}
        {footer && (
          <div className="relative z-10 mt-6 text-center text-xs text-slate-400 sm:text-sm lg:mt-[clamp(0.5rem,2vh,1.5rem)]">
            {footer}
          </div>
        )}
      </div>

      {/* Floating Bottom-Right Project & Guidance Badge */}
      <div className="auth-badge fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 bg-[#091222]/95 backdrop-blur-md border border-cyan-900/60 rounded-2xl px-5 py-4 shadow-2xl text-right transition-all hover:scale-[1.02] hover:border-cyan-700/60 pointer-events-auto shadow-cyan-950/50 max-w-[calc(100vw-2rem)] sm:max-w-sm">
        {/* Developed By Section */}
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            DEVELOPED BY
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-100 tracking-wide mt-0.5">
            Fathima.A
          </div>
          <div className="text-xs font-semibold text-emerald-400 mt-0.5">
            II M.Sc Computer Science
          </div>
        </div>

        {/* Guidance Section */}
        <div className="auth-badge-gap mt-3">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            UNDER THE GUIDANCE OF
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-100 tracking-wide mt-0.5">
            Dr. R. Kavitha Jaba Malar
          </div>
          <div className="text-xs text-slate-400 font-normal mt-0.5">
            Associate Professor &amp; Head
          </div>
          <div className="text-xs text-slate-400 font-normal mt-0.5">
            Postgraduate &amp; Research Dept. of Computer Science
          </div>
          <div className="text-xs font-semibold text-emerald-400 mt-0.5">
            Muslim Arts College, Thiruvithancode
          </div>
        </div>
      </div>
    </div>
  );
}