"use client";

import {
  detailInfoBar,
  detailInfoItem,
  detailInfoLabel,
  detailInfoValue,
  detailSelect,
} from "./project-detail-ui";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
import {
  getProjectDisplayStatus,
  PROJECT_DISPLAY_STATUS_LABELS,
} from "@/lib/project-status";
import { PHASE_LABELS, type Project, type ProjectPhase } from "@/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { isOverdueDeadline, isUrgentDeadline } from "@/lib/dates";

interface ProjectDetailInfoBarProps {
  project: Project;
  studioName?: string;
}

const PHASES = Object.entries(PHASE_LABELS) as [ProjectPhase, string][];

export default function ProjectDetailInfoBar({
  project,
  studioName,
}: ProjectDetailInfoBarProps) {
  const { updateProjectMeta } = useProjectDetailMutations(project.id);
  const displayStatus = getProjectDisplayStatus(project);
  const location = [project.city, project.country].filter(Boolean).join(", ");
  const clientLabel = project.client?.company || project.client?.name;
  const deadlineUrgent =
    project.deadline &&
    (isOverdueDeadline(project.deadline) || isUrgentDeadline(project.deadline));

  return (
    <div className={detailInfoBar}>
      <div className={detailInfoItem}>
        <span className={detailInfoLabel}>Type</span>
        <p className={detailInfoValue}>{project.type || "—"}</p>
      </div>

      <div className={detailInfoItem}>
        <span className={detailInfoLabel}>Phase</span>
        <select
          value={project.phase}
          onChange={(e) =>
            updateProjectMeta.mutate({ phase: e.target.value as ProjectPhase })
          }
          className={cn(detailSelect, "mt-px w-full  border-app bg-[color:var(--glass-bg)] py-0.5 text-[12px]")}
          aria-label="Phase du projet"
        >
          {PHASES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={detailInfoItem}>
        <span className={detailInfoLabel}>Deadline</span>
        <p
          className={cn(
            detailInfoValue,
            deadlineUrgent && "text-red-300/90",
            !project.deadline && "text-glass-muted"
          )}
        >
          {project.deadline
            ? formatDate(project.deadline, "d MMM yyyy")
            : "Non définie"}
        </p>
      </div>

      <div className={detailInfoItem}>
        <span className={detailInfoLabel}>Statut</span>
        <p className={detailInfoValue}>
          {PROJECT_DISPLAY_STATUS_LABELS[displayStatus]}
        </p>
      </div>

      <div className={detailInfoItem}>
        <span className={detailInfoLabel}>Client</span>
        <p className={detailInfoValue}>{clientLabel || "—"}</p>
      </div>

      <div className={detailInfoItem}>
        <span className={detailInfoLabel}>Studio</span>
        <p className={detailInfoValue}>{studioName || "—"}</p>
      </div>

      <div className={detailInfoItem}>
        <span className={detailInfoLabel}>Localisation</span>
        <p className={detailInfoValue}>{location || "—"}</p>
      </div>

      <div className={detailInfoItem}>
        <span className={detailInfoLabel}>Surface</span>
        <p className={detailInfoValue}>
          {project.surface != null ? `${project.surface} m²` : "—"}
        </p>
      </div>

      <div className={detailInfoItem}>
        <span className={detailInfoLabel}>Budget</span>
        <p className={detailInfoValue}>
          {project.budget != null ? formatCurrency(project.budget) : "—"}
        </p>
      </div>
    </div>
  );
}
