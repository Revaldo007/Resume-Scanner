import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import * as api from "../services/api";
import { getScoreInfo } from "../components/ScoreCard";

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load dashboard statistics."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Dashboard</h2>

      {loading && <p className="text-slate-500">Loading statistics...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Resumes Analysed" value={stats.total_resumes_analysed} icon="📄" />
            <StatCard label="Total Job Requirements" value={stats.total_job_requirements} icon="📋" />
            <StatCard label="Average Matching Score" value={`${stats.average_matching_score}%`} icon="🎯" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => navigate("/jobs")}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-indigo-300 hover:shadow-sm transition"
            >
              <p className="font-medium text-slate-800">＋ Create Job Requirement</p>
              <p className="text-sm text-slate-500 mt-1">Define a role to screen candidates against.</p>
            </button>
            <button
              onClick={() => navigate("/resumes/upload")}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-indigo-300 hover:shadow-sm transition"
            >
              <p className="font-medium text-slate-800">📤 Upload Resumes</p>
              <p className="text-sm text-slate-500 mt-1">Add single or multiple candidate resumes.</p>
            </button>
            <button
              onClick={() => navigate("/comparison")}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-indigo-300 hover:shadow-sm transition"
            >
              <p className="font-medium text-slate-800">⚖️ Compare Candidates</p>
              <p className="text-sm text-slate-500 mt-1">Rank candidates by matching score.</p>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-medium text-slate-800">Recent Screening Results</h3>
            </div>
            {stats.recent_screening_results.length === 0 ? (
              <p className="text-sm text-slate-500 p-5">
                No screening results yet. Upload a resume and analyse it against a job requirement.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="px-5 py-2 font-medium">Resume ID</th>
                    <th className="px-5 py-2 font-medium">Job ID</th>
                    <th className="px-5 py-2 font-medium">Overall Score</th>
                    <th className="px-5 py-2 font-medium">Match Level</th>
                    <th className="px-5 py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_screening_results.map((r) => {
                    const info = getScoreInfo(r.overall_score);
                    return (
                      <tr key={r.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3 text-slate-700">#{r.resume_id}</td>
                        <td className="px-5 py-3 text-slate-700">#{r.job_id}</td>
                        <td className="px-5 py-3 font-medium text-slate-800">{r.overall_score}%</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full bg-${info.color}-50 text-${info.color}-700`}>
                            {info.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {new Date(r.analysed_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
