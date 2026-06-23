import { Link, Outlet } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-11 shrink-0 items-center gap-4 border-b border-border bg-panel px-4">
        <Link to="/projects" className="text-sm font-semibold">
          Chatbot Builder
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted">{user?.email}</span>
          <button onClick={logout} className="text-xs text-muted hover:text-slate-200">
            Выйти
          </button>
        </div>
      </header>
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
