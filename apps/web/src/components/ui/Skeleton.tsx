import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-sm)] bg-[length:200%_100%]",
        "bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface-2)] to-[var(--color-surface)]",
        "animate-[shimmer_1.5s_ease-in-out_infinite]",
        className
      )}
    />
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-[var(--color-border)]">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-48 flex-1" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}