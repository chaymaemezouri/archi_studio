"use client";

import { Calendar, Pencil, Share2, Star } from "lucide-react";
import toast from "react-hot-toast";
import ProjectDetailMenu from "./ProjectDetailMenu";
import ProjectDetailQuickAddMenu from "./ProjectDetailQuickAddMenu";
import { ProjectStatusBadge } from "../card/ProjectCardParts";
import DeadlineStatusBadge from "@/components/dashboard/DeadlineStatusBadge";
import {
  detailBtnSecondary,
  detailCaption,
  detailGroupDivider,
  detailIconBtn,
  detailInfoGroup,
  detailInfoGroupGrid,
  detailInfoGroupRow,
  detailInfoGroupTitle,
  detailInfoLabel,
  detailInfoPanel,
  detailInfoPanelToolbar,
  detailInfoValue,
  detailLink,
  detailProgressBarTrack,
  detailSelect,
  detailTextStrong,
} from "./project-detail-ui";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
import {
  getProjectDisplayStatus,
  getProjectProgressRingStroke,
  PROJECT_DISPLAY_STATUS_LABELS,
} from "@/lib/project-status";
import {
  getPhaseOptionsForCategory,
  PROJECT_CATEGORY_SHORT_LABELS,
  PROJECT_SCALE_LABELS,
} from "@/lib/project-phases";
import type { Project, ProjectPhase } from "@/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { isOverdueDeadline, isUrgentDeadline } from "@/lib/dates";
import type { ProjectQuickAddMode, ProjectUploadKind } from "./project-detail-types";
import type { ProjectTabId } from "./ProjectDetailTabs";

interface ProjectDetailInfoPanelProps {
  project: Project;
  onEdit: () => void;
  onQuickAdd: (mode: ProjectQuickAddMode) => void;
  onUpload: (kind: ProjectUploadKind) => void;
  onTabChange: (tab: ProjectTabId) => void;
}

function InfoField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(detailInfoGroupRow, className)}>
      <span className={detailInfoLabel}>{label}</span>
      <div className={detailInfoValue}>{value}</div>
    </div>
  );
}

const PHASES = (project: Project) =>
  getPhaseOptionsForCategory(project.projectCategory ?? "PRIVATE", project.phase);

export default function ProjectDetailInfoPanel({
  project,
  onEdit,
  onQuickAdd,
  onUpload,
  onTabChange,
}: ProjectDetailInfoPanelProps) {
  const { updateProjectMeta } = useProjectDetailMutations(project.id);
  const displayStatus = getProjectDisplayStatus(project);
  const progress = project.progress ?? 0;
  const progressColor = getProjectProgressRingStroke(progress);
  const clientLabel = project.client?.company || project.client?.name;
  const location = [project.address, project.city, project.country]
    .filter(Boolean)
    .join(", ");
  const deadlineUrgent =
    project.deadline &&
    (isOverdueDeadline(project.deadline) || isUrgentDeadline(project.deadline));

  const nextDeadline = (project.deadlines ?? [])
    .filter((d) => !d.done)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: project.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié");
    } catch {
      toast.error("Partage annulé");
    }
  };

  return (
    <div className={detailInfoPanel}>
      <div className={detailInfoPanelToolbar}>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <ProjectStatusBadge
              status={displayStatus}
              size="sm"
              className="border-glass bg-[color:var(--glass-bg-hover)]"
            />
            {project.city && (
              <span className="truncate text-[11px] text-glass-muted">{project.city}</span>
            )}
          </div>
          <h1 className="text-lg font-bold tracking-tight text-glass sm:text-xl">
            {project.name}
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <button type="button" onClick={share} className={detailBtnSecondary}>
            <Share2 className="h-3 w-3" />
            <span className="hidden sm:inline">Partager</span>
          </button>
          <button type="button" onClick={onEdit} className={detailBtnSecondary}>
            <Pencil className="h-3 w-3" />
            <span className="hidden sm:inline">Modifier</span>
          </button>
          <ProjectDetailQuickAddMenu onQuickAdd={onQuickAdd} onUpload={onUpload} />
          <ProjectDetailMenu project={project} onEdit={onEdit} />
          <button
            type="button"
            onClick={() => updateProjectMeta.mutate({ isFavorite: !project.isFavorite })}
            className={detailIconBtn}
            aria-label={project.isFavorite ? "Retirer des favoris" : "Favori"}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                project.isFavorite ? "fill-amber-400 text-amber-400" : "text-glass-muted"
              )}
            />
          </button>
        </div>
      </div>

      <div className={detailInfoGroup}>
        <h2 className={detailInfoGroupTitle}>Identité du projet</h2>
        <div className={detailInfoGroupGrid}>
          <InfoField label="Client" value={clientLabel || "—"} />
          <InfoField label="Localisation" value={location || "—"} />
          <InfoField label="Nature" value={project.projectNature || "—"} />
          <InfoField
            label="Catégorie"
            value={
              project.projectCategory
                ? PROJECT_CATEGORY_SHORT_LABELS[project.projectCategory]
                : "Privé"
            }
          />
          <InfoField
            label="Taille"
            value={
              project.projectScale
                ? PROJECT_SCALE_LABELS[project.projectScale]
                : "—"
            }
            className="sm:col-span-2"
          />
        </div>
      </div>

      <div className={detailGroupDivider} />

      <div className={detailInfoGroup}>
        <h2 className={detailInfoGroupTitle}>Données techniques</h2>
        <div className={detailInfoGroupGrid}>
          <InfoField label="Type" value={project.type || "—"} />
          <InfoField
            label="Surface"
            value={project.surface != null ? `${project.surface} m²` : "—"}
          />
          <InfoField
            label="Surface titre"
            value={
              project.titleSurface != null ? `${project.titleSurface} m²` : "—"
            }
          />
          <InfoField
            label="Budget estimé"
            value={project.budget != null ? formatCurrency(project.budget) : "—"}
          />
          <InfoField
            label="Date de prise"
            value={
              project.intakeDate
                ? formatDate(project.intakeDate, "d MMM yyyy")
                : "—"
            }
            className="sm:col-span-2"
          />
        </div>
      </div>

      <div className={detailGroupDivider} />

      <div className={detailInfoGroup}>
        <h2 className={detailInfoGroupTitle}>Pilotage</h2>
        <div className={detailInfoGroupGrid}>
          <InfoField
            label="Phase actuelle"
            value={
              <select
                value={project.phase}
                onChange={(e) =>
                  updateProjectMeta.mutate({
                    phase: e.target.value as ProjectPhase,
                  })
                }
                className={cn(detailSelect, "mt-px w-full py-0.5")}
                aria-label="Phase du projet"
              >
                {PHASES(project).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            }
          />
          <InfoField
            label="Statut"
            value={PROJECT_DISPLAY_STATUS_LABELS[displayStatus]}
          />
          <div className={cn(detailInfoGroupRow, "sm:col-span-2")}>
            <span className={detailInfoLabel}>Progression globale</span>
            <div className="mt-1.5">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="text-glass-muted">Avancement</span>
                <span className="tabular-nums font-medium text-glass-secondary">
                  {progress}%
                </span>
              </div>
              <div className={detailProgressBarTrack}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, progress))}%`,
                    backgroundColor:
                      progressColor === "transparent"
                        ? "rgba(139,164,199,0.55)"
                        : progressColor,
                  }}
                />
              </div>
            </div>
          </div>
          <InfoField
            label="Deadline"
            value={
              <span
                className={cn(
                  deadlineUrgent && "text-red-300/90",
                  !project.deadline && "text-glass-muted"
                )}
              >
                {project.deadline
                  ? formatDate(project.deadline, "d MMM yyyy")
                  : "Non définie"}
              </span>
            }
          />
          <div className={cn(detailInfoGroupRow, "sm:col-span-2")}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className={detailInfoLabel}>Prochaine action</span>
              <button
                type="button"
                onClick={() => onQuickAdd("deadline")}
                className={detailLink}
              >
                Ajouter
              </button>
            </div>
            {nextDeadline ? (
              <div className="flex items-start justify-between gap-2 rounded-lg border border-app bg-[color:var(--glass-bg)] px-2.5 py-2">
                <div className="min-w-0">
                  <p className={detailTextStrong}>{nextDeadline.title}</p>
                  <p className={detailCaption}>
                    <Calendar className="mr-1 inline h-3 w-3 text-studio-light/60" />
                    {formatDate(nextDeadline.date, "d MMMM yyyy")}
                  </p>
                </div>
                <DeadlineStatusBadge
                  date={nextDeadline.date}
                  done={nextDeadline.done}
                  showOverdueDetail
                />
              </div>
            ) : (
              <p className="text-xs text-glass-muted">Aucune deadline à venir</p>
            )}
            <button
              type="button"
              onClick={() => onTabChange("planning")}
              className={cn(detailLink, "mt-1.5 block")}
            >
              Voir toutes les deadlines
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
