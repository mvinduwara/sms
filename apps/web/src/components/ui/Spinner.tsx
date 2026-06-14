import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-3",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full border-[var(--color-border-2)] border-t-[var(--color-accent)] animate-[spin_0.7s_linear_infinite]",
        sizes[size],
        className
      )}
    />
  );
}