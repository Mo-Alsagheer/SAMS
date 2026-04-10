import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  getAuthUser,
  getHomeRouteForRole,
  getAuthToken,
  normalizeRole,
} from "@/features/auth/session";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const token = getAuthToken();
  const user = getAuthUser();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0) {
    const role = normalizeRole(user.role);
    const normalizedAllowedRoles = allowedRoles.map((allowedRole) =>
      normalizeRole(allowedRole),
    );

    if (!normalizedAllowedRoles.includes(role)) {
      return <Navigate to={getHomeRouteForRole(user.role)} replace />;
    }
  }

  return <Outlet />;
}
