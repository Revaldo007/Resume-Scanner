export default function ResumeCard({ resume, selected, onSelect, onView }) {
  return (
    <div
      className={`border rounded-xl p-4 bg-white transition-colors ${
        selected ? "border-indigo-400 ring-2 ring-indigo-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={!!selected}
              onChange={() => onSelect(resume.id)}
              className="mt-1.5 h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
          )}
          <div>
            <p className="font-semibold text-slate-800">
              {resume.candidate_name || "Unknown Candidate"}
            </p>
            <p className="text-xs text-slate-500">{resume.file_name}</p>
            <div className="flex gap-3 mt-1 text-xs text-slate-500">
              {resume.email && <span>{resume.email}</span>}
              {resume.phone && <span>{resume.phone}</span>}
            </div>
          </div>
        </div>
        {onView && (
          <button
            onClick={() => onView(resume.id)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 shrink-0"
          >
            View →
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {(resume.skills || []).slice(0, 6).map((skill) => (
          <span
            key={skill}
            className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
          >
            {skill}
          </span>
        ))}
        {(resume.skills || []).length > 6 && (
          <span className="text-[11px] text-slate-400">
            +{resume.skills.length - 6} more
          </span>
        )}
      </div>

      <div className="flex justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
        <span>{resume.experience_years || 0} yrs experience</span>
        <span>{resume.file_size_kb} KB</span>
      </div>
    </div>
  );
}
