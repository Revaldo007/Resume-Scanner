import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// For pages like /login and /register: signed-in users are sent to the dashboard
export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
