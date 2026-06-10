"use client";

import Link from "next/link";
import { Building2, CheckSquare, ExternalLink, FileText, Pencil } from "lucide-react";
import IconActionButton from "./detail/IconActionButton";
import { detailIconActionGroup } from "./detail/project-detail-ui";
import Tooltip from "@/components/ui/Tooltip";
import ProjectCardMenu from "./ProjectCardMenu";
import ProjectCountIndicators from "./ProjectCountIndicators";
import { ProjectProgressRing } from "./card/ProjectCardParts";
import {
  projectCardActionBtn,
  projectListColActions,
  projectListColClient,
  projectListColContenus,
  projectListColDeadline,
  projectListColPhase,
  projectListColProgress,
  projectListColProjet,
  projectListColVille,
  projectListGrid,
  projectListRowShell,
} from "./card/project-card-styles";
import { ProjectListDeadlineCell } from "./list/ProjectListParts";
import { getListRowAccentBorder, projectListRowBorder } from "./list/project-list-utils";
import type { ProjectMenuQuickAdd } from "./ProjectCardMenu";
import { computeProjectOverallProgress } from "@/lib/project-progress";
import {
  getProjectDisplayStatus,
  getProjectNextDeadline,
  isProjectDelivered,
  isProjectOverdue,
} from "@/lib/project-status";
import { canAddProjectContent, canEditProject } from "@/lib/permissions";
import { resolveMediaUrl } from "@/lib/assets";
import { useAuthStore } from "@/store/authStore";
import { glassBtnIcon } from "@/lib/glass-styles";
import { PHASE_LABELS } from "@/types";
import type { Project } from "@/types";
import { cn, formatDate } from "@/lib/utils";

interface ProjectListRowProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onQuickAdd?: (mode: ProjectMenuQuickAdd, project: Project) => void;
}

function getClientLabel(project: Project): string {
  return project.client?.company || project.client?.name || "Client non défini";
}

function getCityLabel(project: Project): string {
  const parts = [project.city, project.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Adresse non définie";
}

function getDeadlineDateLabel(deadlineDate: string | null | undefined): string {
  if (!deadlineDate) return "Deadline non définie";
  return formatDate(deadlineDate, "dd MMM yyyy");
}

function ProjectThumb({ imageSrc }: { imageSrc: string | null | undefined }) {
  return (
    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-glass bg-[color:var(--glass-bg)]">
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover transition duration-200 group-hover/row:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-white/[0.05] to-transparent">
          <Building2 className="h-4 w-4 text-white/18" strokeWidth={1.25} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
}

function ProjectListProjectCell({
  project,
  href,
  imageSrc,
}: {
  project: Project;
  href: string;
  imageSrc: string | null | undefined;
}) {
  return (
    <Link href={href} className="flex min-w-0 flex-1 items-center gap-2.5">
      <ProjectThumb imageSrc={imageSrc} />
      <div className="min-w-0 flex-1">
        <Tooltip label={project.name}>
          <p className="truncate text-[13px] font-semibold leading-tight text-white/[0.92] group-hover/row:text-white">
            {project.name}
          </p>
        </Tooltip>
        {project.type && (
          <p className="mt-0.5 truncate text-[10px] text-glass-muted" title={project.type}>
            {project.type}
          </p>
        )}
      </div>
    </Link>
  );
}

function ListActions({
  project,
  onEdit,
  onQuickAdd,
}: {
  project: Project;
  onEdit?: (project: Project) => void;
  onQuickAdd?: (mode: ProjectMenuQuickAdd, project: Project) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const canAdd = canAddProjectContent(user);
  const canEdit = canEditProject(user, project);
  const projectHref = `/projects/${project.id}`;

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={detailIconActionGroup}>
      <IconActionButton
        label="Ouvrir le projet"
        icon={ExternalLink}
        tone="view"
        href={projectHref}
        onClick={stop}
      />
      {canAdd && onQuickAdd && (
        <IconActionButton
          label="Ajouter une tâche"
          icon={CheckSquare}
          tone="upload"
          onClick={(e) => {
            stop(e);
            onQuickAdd("task", project);
          }}
        />
      )}
      <IconActionButton
        label="Documents"
        icon={FileText}
        tone="download"
        href={`${projectHref}?tab=documents`}
        onClick={stop}
      />
      {canEdit && onEdit && (
        <IconActionButton
          label="Modifier"
          icon={Pencil}
          tone="notes"
          onClick={(e) => {
            stop(e);
            onEdit(project);
          }}
        />
      )}
      <ProjectCardMenu
        project={project}
        variant="list"
        onEdit={() => onEdit?.(project)}
        onQuickAdd={onQuickAdd}
        triggerClassName={cn(glassBtnIcon, "h-6 w-6 border-0")}
      />
    </div>
  );
}

export default function ProjectListRow({ project, onEdit, onQuickAdd }: ProjectListRowProps) {
  const imageSrc = resolveMediaUrl(project.imageUrl);
  const nextDeadline = getProjectNextDeadline(project);
  const deadlineDate = nextDeadline?.date ?? project.deadline ?? null;
  const overdue = isProjectOverdue(project);
  const delivered = isProjectDelivered(project);
  const displayStatus = getProjectDisplayStatus(project);
  const progress = computeProjectOverallProgress(project);
  const href = `/projects/${project.id}`;
  const deadlineLabel = getDeadlineDateLabel(deadlineDate);

  const rowState = cn(
    projectListRowShell,
    projectListRowBorder,
    getListRowAccentBorder(overdue, delivered && !overdue)
  );

  return (
    <>
      {/* Mobile — card compacte */}
      <div className={cn(rowState, "space-y-2.5 p-3 lg:hidden")}>
        <ProjectListProjectCell project={project} href={href} imageSrc={imageSrc} />

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
          <p className="truncate text-glass-muted" title={getClientLabel(project)}>
            {getClientLabel(project)}
          </p>
          <p className="truncate text-glass-muted" title={PHASE_LABELS[project.phase]}>
            {PHASE_LABELS[project.phase]}
          </p>
          <p className="col-span-2 truncate text-glass-muted" title={getCityLabel(project)}>
            {getCityLabel(project)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <ProjectProgressRing progress={progress} compact showTooltip />
          <ProjectListDeadlineCell
            label={deadlineLabel}
            displayStatus={displayStatus}
            overdue={overdue}
          />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-app pt-2">
          <ProjectCountIndicators
            project={project}
            variant="natural"
            className="text-[11px] text-glass-muted"
          />
          <ListActions project={project} onEdit={onEdit} onQuickAdd={onQuickAdd} />
        </div>
      </div>

      {/* Desktop / tablette */}
      <div className={cn(rowState, projectListGrid, "hidden min-h-[52px] lg:grid")}>
        <div className={projectListColProjet}>
          <ProjectListProjectCell project={project} href={href} imageSrc={imageSrc} />
        </div>

        <div className={projectListColClient}>
          <p
            className="w-full min-w-0 truncate text-left text-[11px] text-glass-muted"
            title={getClientLabel(project)}
          >
            {getClientLabel(project)}
          </p>
        </div>

        <div className={projectListColVille}>
          <p
            className="w-full min-w-0 truncate text-left text-[11px] text-glass-muted"
            title={getCityLabel(project)}
          >
            {getCityLabel(project)}
          </p>
        </div>

        <div className={projectListColPhase}>
          <p
            className="w-full min-w-0 truncate text-left text-[11px] text-glass-muted"
            title={PHASE_LABELS[project.phase]}
          >
            {PHASE_LABELS[project.phase]}
          </p>
        </div>

        <div className={projectListColProgress}>
          <ProjectProgressRing progress={progress} compact showTooltip />
        </div>

        <div className={projectListColDeadline}>
          <ProjectListDeadlineCell
            label={deadlineLabel}
            displayStatus={displayStatus}
            overdue={overdue}
          />
        </div>

        <div className={projectListColContenus}>
          <ProjectCountIndicators
            project={project}
            variant="natural"
            className="text-[11px] leading-snug text-glass-muted"
          />
        </div>

        <div className={projectListColActions}>
          <ListActions project={project} onEdit={onEdit} onQuickAdd={onQuickAdd} />
        </div>
      </div>
    </>
  );
}

const headerCell =
  "block w-full min-w-0 truncate text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-glass-muted leading-none";

export function ProjectListHeader() {
  return (
    <div
      className={cn(
        projectListGrid,
        projectListRowBorder,
        "border-l-transparent",
        "hidden min-h-[52px] rounded-xl border border-app bg-[color:var(--glass-bg)] lg:grid"
      )}
      role="row"
    >
      <div className={projectListColProjet} role="columnheader">
        <span className={headerCell}>Projet</span>
      </div>
      <div className={projectListColClient} role="columnheader">
        <span className={headerCell}>Client</span>
      </div>
      <div className={projectListColVille} role="columnheader">
        <span className={headerCell}>Ville</span>
      </div>
      <div className={projectListColPhase} role="columnheader">
        <span className={headerCell}>Phase</span>
      </div>
      <div className={projectListColProgress} role="columnheader">
        <span className={cn(headerCell, "text-center text-[9px]")} title="Progression">
          Progression
        </span>
      </div>
      <div className={projectListColDeadline} role="columnheader">
        <span className={headerCell}>Deadline</span>
      </div>
      <div className={projectListColContenus} role="columnheader">
        <span className={headerCell}>Contenus</span>
      </div>
      <div className={projectListColActions} role="columnheader">
        <span className={cn(headerCell, "text-right")}>Actions</span>
      </div>
    </div>
  );
}
