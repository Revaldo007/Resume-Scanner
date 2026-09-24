import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT token (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, force the user back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Turn any axios error into a readable message for the UI.
// - No response at all  -> the backend is not running / not reachable
// - Otherwise           -> the "detail" message sent by the FastAPI backend
export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err?.response) {
    const detail = err.response.data?.detail;
    if (typeof detail === "string" && detail) return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return fallback;
  }
  if (err?.request) {
    return `Cannot reach the server at ${API_BASE_URL}. Make sure the backend is running.`;
  }
  return fallback;
};

// --- Auth ---
export const login = (username, password) =>
  api.post("/api/auth/login", { username, password });

export const register = (username, password) =>
  api.post("/api/auth/register", { username, password });

export const getCurrentUser = () => api.get("/api/auth/me");

// --- Jobs ---
export const createJob = (data) => api.post("/api/jobs", data);
export const getJobs = () => api.get("/api/jobs");
export const getJob = (id) => api.get(`/api/jobs/${id}`);
export const updateJob = (id, data) => api.put(`/api/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/api/jobs/${id}`);

// --- Resumes ---
export const uploadResume = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/resumes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};

export const uploadMultipleResumes = (files, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return api.post("/api/resumes/upload-multiple", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};

export const getResumes = () => api.get("/api/resumes");
export const getResume = (id) => api.get(`/api/resumes/${id}`);

// --- Screening ---
export const analyseSingle = (resumeId, jobId) =>
  api.post(`/api/screening/analyse/${resumeId}/${jobId}`);

export const analyseMultiple = (resumeIds, jobId) =>
  api.post("/api/screening/analyse-multiple", { resume_ids: resumeIds, job_id: jobId });

export const getScreeningResults = () => api.get("/api/screening/results");
export const getScreeningResult = (id) => api.get(`/api/screening/results/${id}`);

// --- Dashboard ---
export const getDashboardStats = () => api.get("/api/dashboard/statistics");

export default api;
