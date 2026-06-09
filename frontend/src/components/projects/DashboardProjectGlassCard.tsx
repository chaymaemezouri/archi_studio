"use client";

import Link from "next/link";
import { PHASE_LABELS } from "@/types";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import {
  dashboardGlassCardFooter,
  dashboardGlassCardShell,
} from "./card/project-card-styles";
import { ProjectCardMedia } from "./card/ProjectCardParts";

interface DashboardProjectGlassCardProps {
  project: Project;
  className?: string;
}

export default function DashboardProjectGlassCard({
  project,
  className,
}: DashboardProjectGlassCardProps) {
  const href = `/projects/${project.id}`;
  const progress = project.progress ?? 0;
  const clientLabel = project.client?.company || project.client?.name;
  const metaLine = [project.city, PHASE_LABELS[project.phase]].filter(Boolean).join(" · ");

  return (
    <Link href={href} className={cn(dashboardGlassCardShell, className)}>
      <ProjectCardMedia
        project={project}
        href={href}
        aspectClass="aspect-[16/10]"
        compact
        disableLink
        variant="dashboard"
        imageProgress={progress}
      />

      <div className={dashboardGlassCardFooter}>
        <p className="truncate text-[12px] font-semibold leading-snug text-[color:var(--pc-title)] transition group-hover/card:text-studio-light">
          {project.name}
        </p>
        {clientLabel && (
          <p className="mt-0.5 truncate text-[10px] text-[color:var(--pc-subtitle)]">{clientLabel}</p>
        )}
        {metaLine && (
          <p className="mt-0.5 truncate text-[9px] text-[color:var(--pc-meta)]">{metaLine}</p>
        )}
      </div>
    </Link>
  );
}
