import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import * as api from "../services/api";
import { getScoreInfo } from "../components/ScoreCard";

export default function ScreeningHistory() {
  const [results, setResults] = useState([]);
  const [resumesById, setResumesById] = useState({});
  const [jobsById, setJobsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getScreeningResults(), api.getResumes(), api.getJobs()])
      .then(([resultsRes, resumesRes, jobsRes]) => {
        setResults(resultsRes.data);

        const rMap = {};
        resumesRes.data.forEach((r) => (rMap[r.id] = r));
        setResumesById(rMap);

        const jMap = {};
        jobsRes.data.forEach((j) => (jMap[j.id] = j));
        setJobsById(jMap);
      })
      .catch(() => setError("Could not load screening history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Screening History</h2>

      {loading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && results.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
          No screening history yet. Analyse a resume against a job requirement to see it here.
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Candidate</th>
                <th className="px-5 py-3 font-medium">Job Title</th>
                <th className="px-5 py-3 font-medium">Matching Score</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date Analysed</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => {
                const resume = resumesById[result.resume_id];
                const job = jobsById[result.job_id];
                const info = getScoreInfo(result.overall_score);
                return (
                  <tr key={result.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">
                        {resume?.candidate_name || `Resume #${result.resume_id}`}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {job?.job_title || `Job #${result.job_id}`}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">{result.overall_score}%</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-${info.color}-50 text-${info.color}-700`}>
                        {info.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(result.analysed_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => navigate(`/screening/${result.id}`)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        View Full Analysis →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
