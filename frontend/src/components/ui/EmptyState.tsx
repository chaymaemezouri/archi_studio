import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassBtnPrimary, glassPanel } from "@/lib/glass-styles";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        glassPanel,
        "flex flex-col items-center justify-center border-dashed px-6 py-16 text-center"
      )}
    >
      <div className="mb-4 rounded-full bg-[color:var(--glass-bg-hover)] p-4 ring-1 ring-inset ring-[color:var(--glass-input-border)]">
        <Icon className="h-8 w-8 text-glass-muted" />
      </div>
      <h3 className="text-lg font-medium text-app-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-glass-secondary">{description}</p>
      )}
      {actionLabel && onAction && (
        <button type="button" className={cn(glassBtnPrimary, "mt-6")} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
