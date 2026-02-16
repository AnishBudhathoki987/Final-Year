import { Navigate, Outlet } from "react-router-dom";

export default function RoleRoute({ user, roles }) {
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
