import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-10">
      <div className="flex flex-col">
        <h1 className="font-display font-semibold text-[var(--color-text-primary)] text-base leading-none">
          {title}
        </h1>
        {subtitle && (
          <span className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}