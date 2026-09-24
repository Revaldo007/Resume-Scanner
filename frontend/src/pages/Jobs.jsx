import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import * as api from "../services/api";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const loadJobs = () => {
    setLoading(true);
    api
      .getJobs()
      .then((res) => setJobs(res.data))
      .catch(() => setError("Could not load job requirements."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job requirement? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete job requirement.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectForScreening = (job) => {
    navigate("/resumes/upload", { state: { jobId: job.id, jobTitle: job.job_title } });
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Job Requirements</h2>
        <button
          onClick={() => navigate("/jobs/new")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2"
        >
          ＋ Create Job Requirement
        </button>
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && jobs.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
          No job requirements yet. Create one to start screening candidates.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{job.job_title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Created {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {job.job_description && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{job.job_description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div>
                <p className="text-slate-400">Required Skills</p>
                <p className="text-slate-700">{job.required_skills || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400">Preferred Skills</p>
                <p className="text-slate-700">{job.preferred_skills || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400">Min. Education</p>
                <p className="text-slate-700">{job.minimum_education || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400">Min. Experience</p>
                <p className="text-slate-700">{job.minimum_experience || 0} yrs</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleSelectForScreening(job)}
                className="text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg px-3 py-1.5"
              >
                Select for Screening
              </button>
              <button
                onClick={() => navigate(`/jobs/${job.id}/edit`)}
                className="text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg px-3 py-1.5"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(job.id)}
                disabled={deletingId === job.id}
                className="text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg px-3 py-1.5 ml-auto disabled:opacity-50"
              >
                {deletingId === job.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
