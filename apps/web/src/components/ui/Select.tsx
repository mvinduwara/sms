import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
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
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-9 pl-3 pr-8 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono text-sm",
              "outline-none appearance-none cursor-pointer",
              "focus:border-[var(--color-accent)]",
              "transition-colors duration-150",
              error && "border-[var(--color-danger)]",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[var(--color-surface)]"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger)]">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";