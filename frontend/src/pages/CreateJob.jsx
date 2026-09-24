import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import * as api from "../services/api";

const emptyForm = {
  job_title: "",
  job_description: "",
  required_skills: "",
  preferred_skills: "",
  minimum_education: "",
  minimum_experience: 0,
};

export default function CreateJob() {
  const { jobId } = useParams();
  const isEditing = !!jobId;
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (isEditing) {
      api
        .getJob(jobId)
        .then((res) => {
          const { job_title, job_description, required_skills, preferred_skills, minimum_education, minimum_experience } = res.data;
          setForm({ job_title, job_description, required_skills, preferred_skills, minimum_education, minimum_experience });
        })
        .catch(() => setLoadError("Could not load this job requirement."));
    }
  }, [jobId, isEditing]);

  const handleChange = (field) => (e) => {
    const value = field === "minimum_experience" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.job_title.trim()) errs.job_title = "Job title is required.";
    if (form.minimum_experience < 0) errs.minimum_experience = "Experience cannot be negative.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.updateJob(jobId, form);
      } else {
        await api.createJob(form);
      }
      navigate("/jobs");
    } catch (err) {
      setLoadError(err.response?.data?.detail || "Failed to save job requirement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">
        {isEditing ? "Edit Job Requirement" : "Create Job Requirement"}
      </h2>

      {loadError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {loadError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
          <input
            type="text"
            value={form.job_title}
            onChange={handleChange("job_title")}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Backend Developer"
          />
          {errors.job_title && <p className="text-xs text-red-600 mt-1">{errors.job_title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
          <textarea
            value={form.job_description}
            onChange={handleChange("job_description")}
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief description of the role..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Required Skills <span className="text-slate-400 font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={form.required_skills}
            onChange={handleChange("required_skills")}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="python, fastapi, sql, git"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Preferred Skills <span className="text-slate-400 font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={form.preferred_skills}
            onChange={handleChange("preferred_skills")}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="docker, aws"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Education</label>
            <input
              type="text"
              value={form.minimum_education}
              onChange={handleChange("minimum_education")}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="b.tech"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Experience (years)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.minimum_experience}
              onChange={handleChange("minimum_experience")}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.minimum_experience && (
              <p className="text-xs text-red-600 mt-1">{errors.minimum_experience}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-5 py-2.5"
          >
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Job Requirement"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 px-5 py-2.5"
          >
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}
