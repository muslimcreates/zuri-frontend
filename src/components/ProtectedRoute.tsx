import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="page-loading">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  // Cart/checkout/orders all require a confirmed email (see the backend's
  // requireVerifiedEmail middleware) — send unverified users to confirm
  // first, then back to wherever they were headed.
  if (!user.emailVerified) return <Navigate to="/verify-email" state={{ from: location }} replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="page-loading">Loading…</p>;
  // Same state.from pattern as ProtectedRoute, so deep-linking straight to
  // e.g. /admin/orders while logged out returns you there after login
  // instead of dropping you on the default post-login page.
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return <>{children}</>;
}
