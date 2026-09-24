import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import CreateJob from "./pages/CreateJob";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import CandidateComparison from "./pages/CandidateComparison";
import ScreeningHistory from "./pages/ScreeningHistory";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/new"
            element={
              <ProtectedRoute>
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId/edit"
            element={
              <ProtectedRoute>
                <CreateJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resumes/upload"
            element={
              <ProtectedRoute>
                <ResumeUpload />
              </ProtectedRoute>
            }
          />

          <Route
            path="/screening/:resultId"
            element={
              <ProtectedRoute>
                <ResumeAnalysis />
              </ProtectedRoute>
            }
          />

          <Route
            path="/comparison"
            element={
              <ProtectedRoute>
                <CandidateComparison />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <ScreeningHistory />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
