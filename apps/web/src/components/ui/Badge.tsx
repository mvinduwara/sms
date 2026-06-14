import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border-2)]",
  success: "bg-[var(--color-success-glow)] text-[var(--color-success)] border-[rgba(16,185,129,0.25)]",
  warning: "bg-[var(--color-warning-glow)] text-[var(--color-warning)] border-[rgba(245,158,11,0.25)]",
  danger: "bg-[var(--color-danger-glow)] text-[var(--color-danger)] border-[rgba(239,68,68,0.25)]",
  info: "bg-[var(--color-accent-glow)] text-[var(--color-accent)] border-[rgba(59,130,246,0.25)]",
  muted: "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)]",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide border font-mono uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}