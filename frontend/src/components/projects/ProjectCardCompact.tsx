"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import {
  getProjectEffectiveDeadlineDate,
  isProjectOverdue,
} from "@/lib/project-status";
import { PHASE_LABELS } from "@/types";
import type { Project } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import {
  dashboardProjectCardBody,
  dashboardProjectCardShell,
} from "./card/project-card-styles";
import { ProjectCardMedia } from "./card/ProjectCardParts";

interface ProjectCardCompactProps {
  project: Project;
  className?: string;
}

function getDeadlineText(project: Project): string {
  const date = getProjectEffectiveDeadlineDate(project);
  if (!date) return "Non définie";
  return formatDate(date, "dd MMM yyyy");
}

export default function ProjectCardCompact({ project, className }: ProjectCardCompactProps) {
  const href = `/projects/${project.id}`;
  const overdue = isProjectOverdue(project);
  const progress = project.progress ?? 0;
  const phaseLabel = PHASE_LABELS[project.phase];

  const clientLabel = project.client?.company || project.client?.name;
  const locationLabel = project.city;
  const subtitle = clientLabel || locationLabel;

  return (
    <Link href={href} className={cn(dashboardProjectCardShell, "block", className)}>
      <ProjectCardMedia
        project={project}
        href={href}
        aspectClass="aspect-[16/9]"
        compact
        disableLink
        variant="dashboard"
        imageProgress={progress}
      />

      <div className={dashboardProjectCardBody}>
        <p className="truncate text-[14px] font-semibold leading-snug tracking-tight text-white/94 transition duration-300 group-hover/card:text-white">
          {project.name}
        </p>
        {subtitle && (
          <p className="mt-1 truncate text-[11px] leading-tight text-glass-muted">{subtitle}</p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-app pt-2">
          <span
            className={cn(
              "inline-flex min-w-0 items-center gap-1 truncate text-[10px] font-medium",
              overdue ? "text-red-300/90" : "text-glass-muted"
            )}
          >
            <Calendar
              className={cn(
                "h-3 w-3 shrink-0",
                overdue ? "text-red-300/65" : "text-studio-light/45"
              )}
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="truncate">{getDeadlineText(project)}</span>
          </span>
          {phaseLabel && (
            <span className="shrink-0 rounded border border-studio-light/12 bg-studio-light/[0.06] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-studio-light/55">
              {phaseLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
