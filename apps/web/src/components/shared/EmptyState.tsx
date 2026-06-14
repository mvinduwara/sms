interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] [&>svg]:w-6 [&>svg]:h-6">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-display font-semibold text-[var(--color-text-primary)]">
          {title}
        </p>
        {description && (
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}