import { useEffect, useRef, useState } from "react";
import lottie from "lottie-web";

export default function ResumeLottie() {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let anim = null;
    let isCancelled = false;

    fetch("/My%20Resume.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isCancelled || !containerRef.current) return;
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: data,
        });
        setLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load resume Lottie animation:", err);
      });

    return () => {
      isCancelled = true;
      if (anim) {
        anim.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-[300px] xl:w-[330px] flex flex-col items-center justify-center select-none">
      {/* Ambient glowing radial aura */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 via-teal-500/15 to-emerald-500/20 rounded-3xl blur-2xl -z-10 pointer-events-none" />

      {/* Styled card framing the animated resume snugly */}
      <div className="w-full rounded-2xl overflow-hidden border border-cyan-800/50 shadow-2xl shadow-cyan-950/60 bg-[#0e1626] transition-all duration-300 hover:scale-[1.02] hover:border-cyan-600/60">
        <div
          ref={containerRef}
          style={{ width: "100%", aspectRatio: "1468 / 1653", maxHeight: "372px" }}
          className={`w-full transition-all duration-700 ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        />
      </div>
    </div>
  );
}
