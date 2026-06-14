import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--color-text-secondary)] tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-[var(--color-text-muted)] [&>svg]:w-4 [&>svg]:h-4">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-9 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono text-sm",
              "placeholder:text-[var(--color-text-muted)] outline-none",
              "focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-glow)]",
              "transition-colors duration-150",
              prefix ? "pl-9" : "px-3",
              suffix ? "pr-9" : "px-3",
              error && "border-[var(--color-danger)]",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-[var(--color-text-muted)] [&>svg]:w-4 [&>svg]:h-4">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";