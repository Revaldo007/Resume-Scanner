import { useEffect, useRef, useState } from "react";

/*
  Floating bottom-right "Developed by / Under the guidance of" badge.
  Used by AuthCard, so it appears on both the Login and Register pages.

  Behaviour:
  - Automatic loop: closed -> opens -> closed -> opens ...
    One full loop takes 10 seconds (4s closed + 6s open).
  - The loop never stops. (Set PAUSE_ON_HOVER = true below if you want it to wait
    while the mouse is on the badge.)
  - Click the badge any time to open or close it manually.
    The loop keeps running after a click: it carries on from the state you left it in.
*/
const FIRST_OPEN_DELAY = 1200; // ms before the very first automatic open
const CLOSED_TIME = 4000; // ms the badge stays closed in each loop
const OPEN_TIME = 6000; // ms the badge stays open in each loop  (4s + 6s = 10s loop)
const PAUSE_ON_HOVER = false; // true = wait while the mouse is on the badge

const css = `
  @keyframes dev-badge-in {
    from { opacity: 0; transform: translateY(12px) scale(.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes dev-avatar-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(45,212,191,.45), 0 0 14px rgba(45,212,191,.35); }
    50%      { box-shadow: 0 0 0 5px rgba(45,212,191,0),  0 0 22px rgba(52,211,153,.55); }
  }
  .dev-badge { animation: dev-badge-in .6s ease-out .3s both; }
  .dev-avatar { animation: dev-avatar-glow 3s ease-in-out infinite; }
  .dev-divider {
    border-top: 1px solid;
    border-image: linear-gradient(to right, transparent, rgba(45,212,191,.35), transparent) 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .dev-badge, .dev-avatar { animation: none; }
  }

  /* Shorter laptop screens: make the badge a little more compact */
  @media (min-width: 1024px) and (max-height: 820px) {
    .dev-badge-head { padding: 0.65rem 0.9rem !important; }
    .dev-badge-body { padding: 0 0.9rem 0.65rem !important; }
    .dev-badge-gap { margin-top: 0.5rem !important; padding-top: 0.5rem !important; }
    .dev-avatar { width: 2.25rem !important; height: 2.25rem !important; font-size: 0.95rem !important; }
  }
`;

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

export default function DeveloperBadge() {
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const firstRun = useRef(true);

  // Automatic loop: flip open/closed on a timer (paused while hovering)
  useEffect(() => {
    if (PAUSE_ON_HOVER && hovering) return;
    let delay = open ? OPEN_TIME : CLOSED_TIME;
    if (firstRun.current && !open) delay = FIRST_OPEN_DELAY;
    const t = setTimeout(() => {
      firstRun.current = false;
      setOpen((o) => !o);
    }, delay);
    return () => clearTimeout(t);
  }, [open, hovering]);

  const toggle = () => {
    setOpen((o) => !o); // the loop timer restarts from the new state
  };

  return (
    <aside
      className="dev-badge pointer-events-auto group fixed bottom-4 right-4 z-30 w-[19.5rem] max-w-[calc(100vw-2rem)] rounded-2xl bg-gradient-to-br from-cyan-400/70 via-teal-400/30 to-emerald-400/70 p-px shadow-2xl shadow-cyan-950/60 sm:bottom-6 sm:right-6"
      aria-label="Project credits"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <style>{css}</style>

      {/* Soft glow behind the badge */}
      <div className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-cyan-500/15 via-teal-500/10 to-emerald-500/15 blur-xl" />

      <div className="rounded-[15px] bg-[#091222]/95 backdrop-blur-md">
        {/* Always visible: who built it. Click to open / close. */}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="developer-details"
          className="dev-badge-head flex w-full cursor-pointer items-center gap-3 rounded-[15px] px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-300"
        >
          <span className="dev-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-teal-300 to-emerald-400 text-lg font-extrabold text-slate-900 ring-2 ring-teal-200/30">
            F
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Developed by
            </span>
            <span className="mt-0.5 block truncate bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-base font-extrabold tracking-wide text-transparent">
              Fathima.A
            </span>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              II M.Sc Computer Science
            </span>
          </span>
          <Icon
            className={`h-4 w-4 shrink-0 text-teal-300/80 transition-transform duration-300 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          >
            <polyline points="18 15 12 9 6 15" />
          </Icon>
        </button>

        {/* Opens upward: the guide and the college */}
        <div
          id="developer-details"
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="dev-badge-body px-4 pb-3.5">
              <div className="dev-badge-gap dev-divider pt-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                    <Icon>
                      <path d="M22 10 12 5 2 10l10 5 10-5z" />
                      <path d="M6 12v5c3 2 9 2 12 0v-5" />
                    </Icon>
                  </span>
                  <div className="min-w-0 leading-snug">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Under the guidance of
                    </p>
                    <p className="mt-0.5 text-sm font-bold tracking-wide text-slate-100">
                      Dr. R. Kavitha Jaba Malar
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">Associate Professor &amp; Head</p>
                    <p className="text-xs text-slate-400">Postgraduate &amp; Research Dept. of Computer Science</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <Icon className="h-3 w-3 shrink-0">
                        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </Icon>
                      Muslim Arts College, Thiruvithancode
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}