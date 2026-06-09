"use client";

import Link from "next/link";
import { useDialog } from "@/components/providers/DialogProvider";
import { useCreateDeadline } from "@/hooks/useDashboard";
import { useUpdateProject } from "@/hooks/useProjects";
import {
  getProjectDisplayStatus,
  getProjectNextDeadline,
  isProjectOverdue,
} from "@/lib/project-status";
import {
  canShowProjectOnMap,
  getProjectCardLocation,
  getProjectLocationLabel,
  getProjectMapsUrl,
} from "@/lib/project-location";
import { toLocalDateInput } from "@/lib/dates";
import { PHASE_LABELS } from "@/types";
import type { Project, Task } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { projectCardBody, projectCardFooter, projectCardShell } from "./card/project-card-styles";
import {
  ProjectCardFooterCounts,
  ProjectCardImageActions,
  ProjectCardLocationRow,
  ProjectCardMedia,
  ProjectProgressRing,
  ProjectStatusBadge,
} from "./card/ProjectCardParts";

import type { ProjectMenuQuickAdd } from "./ProjectCardMenu";

export interface ProjectCardFullProps {
  project: Project;
  nextTask?: Task | null;
  onEdit?: (project: Project) => void;
  onQuickAdd?: (mode: ProjectMenuQuickAdd, project: Project) => void;
}

function getClientLabel(project: Project): string {
  return project.client?.company || project.client?.name || "Client non défini";
}

function getMetaLine(project: Project): string | null {
  const parts = [
    project.type,
    PHASE_LABELS[project.phase],
    project.surface != null && Number.isFinite(project.surface)
      ? `${project.surface} m²`
      : null,
  ].filter(Boolean) as string[];
  return parts.length > 0 ? parts.join(" · ") : null;
}

function getDeadlineText(deadlineDate: string | null | undefined): string {
  if (!deadlineDate) return "Deadline non définie";
  return `Deadline ${formatDate(deadlineDate, "dd MMM yyyy")}`;
}

export function ProjectCardFull({
  project,
  nextTask,
  onEdit,
  onQuickAdd,
}: ProjectCardFullProps) {
  const siteLabel = getProjectCardLocation(project) || "Adresse non définie";
  const fullAddress = getProjectLocationLabel(project) || siteLabel;
  const mapsUrl = getProjectMapsUrl(project);
  const showMap = canShowProjectOnMap(project);
  const nextDeadline = getProjectNextDeadline(project);
  const deadlineDate = nextDeadline?.date ?? project.deadline ?? null;
  const overdue = isProjectOverdue(project);
  const progress = project.progress ?? 0;
  const displayStatus = getProjectDisplayStatus(project);
  const href = `/projects/${project.id}`;
  const metaLine = getMetaLine(project);

  const { prompt } = useDialog();
  const updateProject = useUpdateProject();
  const createDeadline = useCreateDeadline();

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateProject.mutate({ id: project.id, isFavorite: !project.isFavorite });
  };

  const quickDeadline = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const title = await prompt({
      title: "Nouvelle deadline",
      label: "Titre de la deadline",
      confirmLabel: "Ajouter",
    });
    if (!title) return;
    await createDeadline.mutateAsync({
      title: title.trim(),
      date: toLocalDateInput(new Date()),
      projectId: project.id,
    });
  };

  return (
    <article className={cn(projectCardShell, "min-w-0")}>
      <ProjectCardMedia project={project} href={href} aspectClass="aspect-[5/3]" showBadge={false}>
        <ProjectCardImageActions
          project={project}
          onToggleFavorite={toggleFavorite}
          onQuickDeadline={quickDeadline}
          onEdit={onEdit ? () => onEdit(project) : undefined}
          onQuickAdd={onQuickAdd}
        />
      </ProjectCardMedia>

      <div className={projectCardBody}>
        <div className="flex items-start gap-2.5">
          <Link href={href} className="min-w-0 flex-1">
            <h3 className="truncate text-[13px] font-semibold leading-snug tracking-tight text-[color:var(--pc-title)] transition duration-200 group-hover/card:text-studio-light">
              {project.name}
            </h3>
            <p className="mt-0.5 truncate text-[10px] leading-tight text-[color:var(--pc-subtitle)]">
              {getClientLabel(project)}
            </p>
          </Link>
          <div className="flex shrink-0 flex-col items-end gap-1 pt-px">
            <ProjectStatusBadge status={displayStatus} variant="minimal" />
            <ProjectProgressRing progress={progress} compact />
          </div>
        </div>

        {metaLine && (
          <p className="mt-1 truncate text-[10px] leading-none tracking-wide text-[color:var(--pc-meta)]">
            {metaLine}
          </p>
        )}

        <ProjectCardLocationRow
          siteLabel={siteLabel}
          fullAddress={fullAddress}
          mapsUrl={mapsUrl}
          showMap={showMap}
          compact
        />

        {nextTask?.title && (
          <p className="mt-1 truncate text-[10px] leading-snug text-glass-muted">
            <span className="text-glass-muted">Prochaine · </span>
            {nextTask.title}
          </p>
        )}
      </div>

      <footer className={projectCardFooter}>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <p
            className={cn(
              "min-w-0 truncate text-[10px] font-medium text-[color:var(--pc-deadline)]",
              overdue && deadlineDate && "text-[color:var(--pc-overdue)]"
            )}
            title={getDeadlineText(deadlineDate)}
          >
            {getDeadlineText(deadlineDate)}
          </p>
          {overdue && deadlineDate && (
            <span className="shrink-0 rounded-full border border-[color:var(--badge-danger-ring)] bg-[color:var(--badge-danger-bg)] px-1.5 py-px text-[9px] font-medium text-[color:var(--badge-danger-text)]">
              En retard
            </span>
          )}
        </div>
        <ProjectCardFooterCounts project={project} />
      </footer>
    </article>
  );
}

/** @alias ProjectCardFull — compatibilité imports existants */
export default ProjectCardFull;
