import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-[0_0_24px_var(--color-accent-glow)]",
  secondary:
    "bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] border border-[var(--color-border-2)]",
  ghost:
    "bg-transparent hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
  danger:
    "bg-[var(--color-danger-glow)] hover:bg-[rgba(239,68,68,0.2)] text-[var(--color-danger)] border border-[rgba(239,68,68,0.25)]",
  outline:
    "bg-transparent border border-[var(--color-border-2)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-sm gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-sm)] font-medium font-mono transition-all duration-150 cursor-pointer select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : icon ? (
        <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{iconRight}</span>
      )}
    </button>
  );
}