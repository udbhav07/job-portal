import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const ProtectedRoute = ({ requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // logged in with the wrong role: send them to their own home page
  if (requiredRole && user.role !== requiredRole) {
    const home = user.role === "employer" ? "/employer-dashboard" : "/find-jobs";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
