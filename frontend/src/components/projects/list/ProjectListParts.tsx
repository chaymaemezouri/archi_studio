"use client";

import {
  listProgressBarClass,
  shouldShowDeadlineBadge,
} from "./project-list-utils";
import { ProjectStatusBadge } from "../card/ProjectCardParts";
import type { ProjectDisplayStatus } from "@/lib/project-status";
import { cn } from "@/lib/utils";

export function ProjectListProgressBar({
  progress,
  status,
  className,
}: {
  progress: number;
  status: ProjectDisplayStatus;
  className?: string;
}) {
  const safe = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
  const isZero = safe === 0;

  return (
    <div className={cn("min-w-[72px] space-y-1", className)}>
      <div
        className={cn(
          "h-[3px] overflow-hidden rounded-full",
          isZero ? "bg-[color:var(--glass-bg-hover)]" : "bg-[color:var(--pc-progress-track)]"
        )}
      >
        {!isZero && (
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              listProgressBarClass(status)
            )}
            style={{ width: `${Math.max(4, safe)}%` }}
          />
        )}
      </div>
      <p
        className={cn(
          "text-center text-[10px] tabular-nums leading-none",
          isZero ? "text-glass-muted" : "text-glass-secondary"
        )}
      >
        {safe}%
      </p>
    </div>
  );
}

export function ProjectListDeadlineCell({
  label,
  displayStatus,
  overdue,
  className,
}: {
  label: string;
  displayStatus: ProjectDisplayStatus;
  overdue: boolean;
  className?: string;
}) {
  const undefinedDeadline = label === "Deadline non définie";

  return (
    <div className={cn("flex min-w-0 flex-col justify-center gap-1", className)}>
      <p
        className={cn(
          "truncate text-[11px] leading-tight",
          undefinedDeadline && "text-glass-muted",
          !undefinedDeadline && overdue && "font-semibold text-[color:var(--pc-overdue)]",
          !undefinedDeadline && !overdue && "text-glass-secondary"
        )}
        title={label}
      >
        {label}
      </p>
      {shouldShowDeadlineBadge(displayStatus) && (
        <ProjectStatusBadge
          status={displayStatus}
          size="sm"
          context="list"
          className="w-fit shrink-0"
        />
      )}
    </div>
  );
}
