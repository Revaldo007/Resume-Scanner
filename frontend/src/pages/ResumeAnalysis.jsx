import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ScoreCard from "../components/ScoreCard";
import * as api from "../services/api";

function Section({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function SkillPill({ skill, variant }) {
  const styles = {
    matched: "bg-emerald-50 text-emerald-700",
    missing: "bg-red-50 text-red-600",
    neutral: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[variant]}`}>
      {skill}
    </span>
  );
}

export default function ResumeAnalysis() {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getScreeningResult(resultId)
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load this screening result."))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-500">Loading analysis...</p>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <p className="text-red-600">{error || "Not found."}</p>
      </Layout>
    );
  }

  const { resume, job } = data;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">
            {resume.candidate_name || resume.file_name}
          </h2>
          <p className="text-sm text-slate-500">
            Screened against <span className="font-medium">{job.job_title}</span> ·{" "}
            {new Date(data.analysed_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-slate-600 hover:text-slate-800"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: overall score */}
        <div className="lg:col-span-1 space-y-6">
          <ScoreCard
            score={data.overall_score}
            breakdown={[
              { label: "Skills (50%)", value: data.skills_score },
              { label: "Education (20%)", value: data.education_score },
              { label: "Experience (20%)", value: data.experience_score },
              { label: "Preferred (10%)", value: data.preferred_skills_score },
            ]}
          />

          <Section title="Personal Information">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Name</dt>
                <dd className="text-slate-800 font-medium">{resume.candidate_name || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Email</dt>
                <dd className="text-slate-800">{resume.email || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Phone</dt>
                <dd className="text-slate-800">{resume.phone || "—"}</dd>
              </div>
            </dl>
          </Section>
        </div>

        {/* Right column: details */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Skills Analysis">
            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-1.5">Matched Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {data.matched_required_skills.length === 0 ? (
                  <span className="text-xs text-slate-400">None</span>
                ) : (
                  data.matched_required_skills.map((s) => <SkillPill key={s} skill={s} variant="matched" />)
                )}
              </div>
            </div>
            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-1.5">Missing Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {data.missing_required_skills.length === 0 ? (
                  <span className="text-xs text-slate-400">None — all required skills matched</span>
                ) : (
                  data.missing_required_skills.map((s) => <SkillPill key={s} skill={s} variant="missing" />)
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Matched Preferred Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {data.matched_preferred_skills.length === 0 ? (
                  <span className="text-xs text-slate-400">None</span>
                ) : (
                  data.matched_preferred_skills.map((s) => <SkillPill key={s} skill={s} variant="neutral" />)
                )}
              </div>
            </div>
          </Section>

          <Section title="Education">
            <div className="flex flex-wrap gap-1.5">
              {resume.education.length === 0 ? (
                <span className="text-xs text-slate-400">No education keywords detected</span>
              ) : (
                resume.education.map((e) => <SkillPill key={e} skill={e} variant="neutral" />)
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Job requires: <span className="font-medium">{job.minimum_education || "Not specified"}</span>
            </p>
          </Section>

          <Section title="Experience">
            <div className="flex gap-6 text-sm mb-3">
              <div>
                <p className="text-slate-500 text-xs">Total Experience</p>
                <p className="font-semibold text-slate-800">{resume.experience_years} years</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Required</p>
                <p className="font-semibold text-slate-800">{job.minimum_experience} years</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-1.5">Detected Roles</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {resume.previous_roles.length === 0 ? (
                <span className="text-xs text-slate-400">None detected</span>
              ) : (
                resume.previous_roles.map((r) => <SkillPill key={r} skill={r} variant="neutral" />)
              )}
            </div>
            <p className="text-xs text-slate-500 mb-1.5">Companies (best-effort detection)</p>
            <div className="flex flex-wrap gap-1.5">
              {resume.companies.length === 0 ? (
                <span className="text-xs text-slate-400">None detected</span>
              ) : (
                resume.companies.map((c) => <SkillPill key={c} skill={c} variant="neutral" />)
              )}
            </div>
          </Section>
        </div>
      </div>
    </Layout>
  );
}
