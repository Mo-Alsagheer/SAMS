import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthUser, getAuthToken, normalizeRole, getHomeRouteForRole } from "@/features/auth/session";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const token = getAuthToken();
  const user = getAuthUser();
if (token && !user) {
    return <div>Loading...</div>; 
  }
  // 1. If NOT logged in, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If logged in but doesn't have the right role
  if (allowedRoles.length > 0) {
    const role = normalizeRole(user.role);
    const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r));

    if (!normalizedAllowedRoles.includes(role)) {
      // Send them to their specific dashboard instead of a 404
      return <Navigate to={getHomeRouteForRole(user.role)} replace />;
    }
  }

  return <Outlet />;
}