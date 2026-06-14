import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Users2,
  MessageSquare,
  BarChart3,
  Settings,
  FileText,
  Layers,
  Radio,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/compose", icon: Send, label: "Compose" },
  { path: "/bulk", icon: Layers, label: "Bulk Send" },
  { path: "/messages", icon: MessageSquare, label: "Messages" },
  { path: "/contacts", icon: Users2, label: "Contacts" },
  { path: "/templates", icon: FileText, label: "Templates" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const location = useLocation();
  const logout = useLogout();
  const { user } = useAuthStore();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-border)]">
        <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center">
          <Radio className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-[var(--color-text-primary)] text-sm leading-none">
            SMS Gateway
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] tracking-widest uppercase mt-0.5">
            Control Panel
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-0.5 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active =
              path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path);
            return (
              <li key={path}>
                <NavLink
                  to={path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm transition-all duration-150",
                    "[&>svg]:w-4 [&>svg]:h-4",
                    active
                      ? "bg-[var(--color-accent-glow)] text-[var(--color-accent)] font-medium"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <Icon />
                  {label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] mb-1">
          <div className="w-7 h-7 rounded-full bg-[var(--color-accent-glow)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center text-[var(--color-accent)] text-xs font-bold uppercase">
            {user?.username?.[0] ?? "A"}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-medium text-[var(--color-text-primary)] truncate">
              {user?.username ?? "Admin"}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] truncate">
              {user?.email ?? ""}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-glow)] transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}