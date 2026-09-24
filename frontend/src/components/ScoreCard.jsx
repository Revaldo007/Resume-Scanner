function getScoreInfo(score) {
  if (score >= 90) return { label: "Excellent match", color: "emerald" };
  if (score >= 75) return { label: "Strong match", color: "green" };
  if (score >= 60) return { label: "Moderate match", color: "amber" };
  return { label: "Low match", color: "red" };
}

const colorClasses = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", ring: "ring-emerald-200" },
  green: { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500", ring: "ring-green-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", ring: "ring-amber-200" },
  red: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500", ring: "ring-red-200" },
};

export default function ScoreCard({ title = "Overall Matching Score", score, breakdown }) {
  const { label, color } = getScoreInfo(score);
  const c = colorClasses[color];

  return (
    <div className={`rounded-xl border ${c.ring} ${c.bg} p-5`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.bg} ${c.text} ring-1 ${c.ring}`}>
          {label}
        </span>
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className={`text-4xl font-bold ${c.text}`}>{score?.toFixed(1)}</span>
        <span className="text-slate-400 text-sm mb-1">/ 100</span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${c.bar} rounded-full transition-all`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      {breakdown && (
        <div className="mt-4 space-y-2">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <span className="w-28 text-slate-500">{item.label}</span>
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-500 rounded-full"
                  style={{ width: `${Math.min(item.value, 100)}%` }}
                />
              </div>
              <span className="w-10 text-right text-slate-600 font-medium">
                {item.value?.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { getScoreInfo };
