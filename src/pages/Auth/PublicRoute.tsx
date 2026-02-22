// src/routes/PublicRoute.tsx
import { Navigate } from "react-router-dom";

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}