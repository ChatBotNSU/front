import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import { Spinner } from "@/shared/ui";

export function RequireAuth() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (status === "anon") return <Navigate to="/login" replace />;
  return <Outlet />;
}
