import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accent?: "blue" | "green" | "yellow" | "red";
  loading?: boolean;
  delay?: number;
}

const accents = {
  blue: {
    icon: "bg-[var(--color-accent-glow)] text-[var(--color-accent)]",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.06)]",
  },
  green: {
    icon: "bg-[var(--color-success-glow)] text-[var(--color-success)]",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.06)]",
  },
  yellow: {
    icon: "bg-[var(--color-warning-glow)] text-[var(--color-warning)]",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.06)]",
  },
  red: {
    icon: "bg-[var(--color-danger-glow)] text-[var(--color-danger)]",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.06)]",
  },
};

export function StatsCard({
  label,
  value,
  sub,
  icon,
  accent = "blue",
  loading = false,
  delay = 0,
}: StatsCardProps) {
  const a = accents[accent];
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-5",
        "animate-[fade-in_0.4s_ease_both]",
        a.glow
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-text-muted)] tracking-widest uppercase">
              {label}
            </span>
            <span
              className="font-display font-bold text-3xl text-[var(--color-text-primary)] animate-[count-up_0.5s_ease_both]"
              style={{ animationDelay: `${delay + 100}ms` }}
            >
              {value}
            </span>
            {sub && (
              <span className="text-xs text-[var(--color-text-muted)]">
                {sub}
              </span>
            )}
          </div>
          <div
            className={cn(
              "w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5",
              a.icon
            )}
          >
            {icon}
          </div>
        </div>
      )}
    </div>
  );
}