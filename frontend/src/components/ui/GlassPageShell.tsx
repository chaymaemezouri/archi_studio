"use client";

import { AlertCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { accentBar } from "@/lib/glass-styles";
import { pageStack, textHeading, textMetaSm } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

type GlassPageShellProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  children?: ReactNode;
  className?: string;
};

export function GlassPageShell({
  title,
  description,
  actions,
  isLoading,
  isError,
  onRetry,
  isEmpty,
  emptyTitle = "Aucun élément",
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  icon: Icon,
  children,
  className,
}: GlassPageShellProps) {
  return (
    <div className={cn(pageStack, className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className={accentBar} aria-hidden />
          <div>
            <h1 className={cn("text-lg font-semibold tracking-tight", textHeading)}>{title}</h1>
            {description ? <p className={cn("mt-0.5", textMetaSm)}>{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-studio-light border-t-transparent"
            aria-label="Chargement"
          />
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Impossible de charger les données"
          description="Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={onRetry}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={Icon ?? AlertCircle}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        children
      )}
    </div>
  );
}

export function GlassListTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-glass bg-[color:var(--glass-bg)] shadow-[var(--glass-shadow-lg)] backdrop-blur-xl", className)}>
      {children}
    </div>
  );
}

export function GlassListHeader({
  columns,
  className,
}: {
  columns: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid border-b border-app px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-glass-muted",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
    >
      {columns.map((col) => (
        <span key={col}>{col}</span>
      ))}
    </div>
  );
}

export function GlassListRow({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "grid w-full border-b border-app px-3 py-2.5 text-left text-[13px] text-glass-secondary transition last:border-b-0",
        onClick && "hover:bg-studio-muted/40",
        className
      )}
    >
      {children}
    </Comp>
  );
}
