import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import * as api from "../services/api";

const ALLOWED_TYPES = [".pdf", ".docx"];

function formatBytes(kb) {
  if (kb > 1024) return `${(kb / 1024).toFixed(2)} MB`;
  return `${kb} KB`;
}

export default function ResumeUpload() {
  const location = useLocation();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(location.state?.jobId || "");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.getJobs().then((res) => setJobs(res.data)).catch(() => {});
  }, []);

  const addFiles = (fileList) => {
    const files = Array.from(fileList);
    const valid = [];
    const rejected = [];

    files.forEach((file) => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_TYPES.includes(ext)) {
        rejected.push(file.name);
      } else {
        valid.push(file);
      }
    });

    if (rejected.length) {
      setError(`Unsupported file type for: ${rejected.join(", ")}. Only PDF and DOCX are allowed.`);
    } else {
      setError("");
    }

    setPendingFiles((prev) => [...prev, ...valid]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    setError("");

    try {
      if (pendingFiles.length === 1) {
        const res = await api.uploadResume(pendingFiles[0]);
        const result = res.data;
        if (result.resume) {
          setUploadedResumes((prev) => [...prev, { ...result.resume, status: "success" }]);
        } else {
          setError(result.warning || "Upload failed.");
        }
      } else {
        const res = await api.uploadMultipleResumes(pendingFiles);
        const results = res.data;
        const successes = results
          .filter((r) => r.resume)
          .map((r) => ({ ...r.resume, status: "success", warning: r.warning }));
        const failures = results.filter((r) => !r.resume);
        setUploadedResumes((prev) => [...prev, ...successes]);
        if (failures.length) {
          setError(failures.map((f) => f.warning).join(" | "));
        }
      }
      setPendingFiles([]);
    } catch (err) {
      setError(api.getErrorMessage(err, "Upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyse = async () => {
    if (!selectedJobId) {
      setError("Please select a job requirement before analysing.");
      return;
    }
    if (uploadedResumes.length === 0) {
      setError("Please upload at least one resume first.");
      return;
    }

    setAnalysing(true);
    setError("");
    try {
      const resumeIds = uploadedResumes.map((r) => r.id);
      if (resumeIds.length === 1) {
        const res = await api.analyseSingle(resumeIds[0], selectedJobId);
        navigate(`/screening/${res.data.id}`);
      } else {
        await api.analyseMultiple(resumeIds, selectedJobId);
        navigate("/comparison", { state: { jobId: Number(selectedJobId) } });
      }
    } catch (err) {
      setError(api.getErrorMessage(err, "Analysis failed. Please try again."));
    } finally {
      setAnalysing(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Resume Upload</h2>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 max-w-3xl">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Select Job Requirement to screen against
        </label>
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
        {jobs.length === 0 && (
          <p className="text-xs text-slate-500 mt-2">
            No job requirements yet.{" "}
            <button onClick={() => navigate("/jobs/new")} className="text-indigo-600 font-medium">
              Create one first
            </button>
            .
          </p>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`max-w-3xl border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragging ? "border-indigo-400 bg-indigo-50" : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <p className="text-3xl mb-2">📄</p>
        <p className="text-sm font-medium text-slate-700">
          Drag & drop resumes here, or click to browse
        </p>
        <p className="text-xs text-slate-400 mt-1">Supports PDF and DOCX · single or multiple files</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {pendingFiles.length > 0 && (
        <div className="max-w-3xl mt-4 bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">
            {pendingFiles.length} file(s) ready to upload
          </p>
          <ul className="space-y-1 mb-3">
            {pendingFiles.map((file, i) => (
              <li key={i} className="flex justify-between items-center text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5">
                <span>{file.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => removePendingFile(i)} className="text-red-500 text-xs">
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2"
          >
            {uploading ? "Uploading & processing..." : "Upload & Extract Information"}
          </button>
        </div>
      )}

      {error && (
        <div className="max-w-3xl text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">
          {error}
        </div>
      )}

      {uploadedResumes.length > 0 && (
        <div className="max-w-3xl mt-6">
          <h3 className="font-medium text-slate-800 mb-3">Uploaded Resumes</h3>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {uploadedResumes.map((resume) => (
              <div key={resume.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {resume.candidate_name || resume.file_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {resume.file_name} · {formatBytes(resume.file_size_kb)} ·{" "}
                    {new Date(resume.uploaded_at).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                  ✓ Processed
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyse}
            disabled={analysing}
            className="mt-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-5 py-2.5"
          >
            {analysing
              ? "Analysing..."
              : uploadedResumes.length === 1
              ? "Analyse Resume"
              : `Analyse & Compare ${uploadedResumes.length} Candidates`}
          </button>
        </div>
      )}
    </Layout>
  );
}
