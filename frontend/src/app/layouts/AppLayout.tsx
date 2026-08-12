import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "@/design-system";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, logout } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen">
      <Sidebar onLogout={logout} />
      <main className="pb-24 md:ml-44 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
