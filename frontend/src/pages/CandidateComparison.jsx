import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import * as api from "../services/api";
import { getScoreInfo } from "../components/ScoreCard";

export default function CandidateComparison() {
  const location = useLocation();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [resumesById, setResumesById] = useState({});
  const [results, setResults] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(location.state?.jobId || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getJobs(), api.getResumes(), api.getScreeningResults()])
      .then(([jobsRes, resumesRes, resultsRes]) => {
        setJobs(jobsRes.data);
        const map = {};
        resumesRes.data.forEach((r) => (map[r.id] = r));
        setResumesById(map);
        setResults(resultsRes.data);

        if (!selectedJobId && jobsRes.data.length > 0) {
          // Default to the most recently used job in the results, if any
          const lastJobId = resultsRes.data[0]?.job_id;
          setSelectedJobId(lastJobId || jobsRes.data[0].id);
        }
      })
      .catch(() => setError("Could not load comparison data."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredResults = useMemo(() => {
    if (!selectedJobId) return [];
    return results
      .filter((r) => String(r.job_id) === String(selectedJobId))
      .sort((a, b) => b.overall_score - a.overall_score);
  }, [results, selectedJobId]);

  const selectedJob = jobs.find((j) => String(j.id) === String(selectedJobId));

  return (
    <Layout>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Candidate Comparison</h2>

      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 max-w-xl">
        <label className="block text-sm font-medium text-slate-700 mb-1">Job Requirement</label>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Select a job requirement —</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.job_title}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && selectedJobId && filteredResults.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500 max-w-3xl">
          No screening results yet for "{selectedJob?.job_title}". Upload and analyse resumes against
          this job to see a comparison.
        </div>
      )}

      {filteredResults.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-4xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 font-medium">Candidate</th>
                <th className="px-5 py-3 font-medium">Skills Match</th>
                <th className="px-5 py-3 font-medium">Education Match</th>
                <th className="px-5 py-3 font-medium">Experience Match</th>
                <th className="px-5 py-3 font-medium">Overall Score</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, index) => {
                const resume = resumesById[result.resume_id];
                const info = getScoreInfo(result.overall_score);
                return (
                  <tr key={result.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-500 font-medium">#{index + 1}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">
                        {resume?.candidate_name || `Resume #${result.resume_id}`}
                      </p>
                      <p className="text-xs text-slate-400">{resume?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{result.skills_score}%</td>
                    <td className="px-5 py-3 text-slate-700">{result.education_score}%</td>
                    <td className="px-5 py-3 text-slate-700">{result.experience_score}%</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-${info.color}-50 text-${info.color}-700`}>
                        {result.overall_score}% · {info.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => navigate(`/screening/${result.id}`)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        View Details →
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
