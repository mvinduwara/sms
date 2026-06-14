import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/authStore";

export function AppShell() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}