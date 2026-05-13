import { Navigate, Outlet, useLocation } from "react-router-dom";

import {
  getAuthToken,
  getCurrentUser,
  normalizeRole,
  getHomeRouteForRole,
  isAuthenticated,
} from "@/features/auth/session";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();

  const token = getAuthToken();
  const user = getCurrentUser();

  // Not logged in
  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role authorization
  if (allowedRoles.length > 0) {
    const role = normalizeRole(user.role);

    const normalizedAllowedRoles = allowedRoles.map((r) => normalizeRole(r));

    if (!normalizedAllowedRoles.includes(role)) {
      return <Navigate to={getHomeRouteForRole(role)} replace />;
    }
  }

  return <Outlet />;
}
