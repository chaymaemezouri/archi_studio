"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarPlus,
  ExternalLink,
  MapPin,
  Pencil,
  Star,
} from "lucide-react";
import IconActionButton from "../detail/IconActionButton";
import Tooltip from "@/components/ui/Tooltip";
import ProjectCardMenu from "../ProjectCardMenu";
import ProjectCountIndicators from "../ProjectCountIndicators";
import {
  getProjectDisplayStatus,
  getProjectProgressRingStroke,
  PROJECT_DISPLAY_STATUS_ACCENT,
  PROJECT_DISPLAY_STATUS_LABELS,
  PROJECT_DISPLAY_STATUS_PILL,
  type ProjectDisplayStatus,
} from "@/lib/project-status";
import { PROJECT_LIST_DEADLINE_PILL } from "../list/project-list-utils";
import { resolveMediaUrl } from "@/lib/assets";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { detailIconActionBtn } from "../detail/project-detail-ui";
import {
  dashboardProjectCardImageOverlayBottom,
  dashboardProjectCardImageOverlayTop,
  projectCardActionBtn,
  projectCardImageActionGroup,
  projectCardImageFadeIntoContent,
  projectCardImageOverlayBottom,
  projectCardImageOverlayTop,
} from "./project-card-styles";

import type { ProjectMenuQuickAdd } from "../ProjectCardMenu";

const PROJECT_DISPLAY_STATUS_MINIMAL_TEXT: Record<ProjectDisplayStatus, string> = {
  archived: "text-glass-muted",
  delivered: "text-emerald-600 dark:text-emerald-400/90",
  overdue: "text-red-600 dark:text-red-400/90",
  today: "text-amber-700 dark:text-amber-400/90",
  tomorrow: "text-amber-700 dark:text-amber-300/85",
  soon: "text-sky-700 dark:text-sky-400/85",
  urgent: "text-orange-700 dark:text-orange-400/85",
  new: "text-sky-700 dark:text-sky-400/85",
  in_progress: "text-glass-secondary",
};

export function ProjectStatusBadge({
  status,
  className,
  size = "md",
  context = "card",
  variant = "pill",
}: {
  status: ProjectDisplayStatus;
  className?: string;
  size?: "sm" | "md";
  /** Liste : pills plus contrastées sur fond blanc */
  context?: "card" | "list";
  /** minimal : discret, pour le corps de carte */
  variant?: "pill" | "minimal";
}) {
  if (variant === "minimal") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-[color:var(--glass-input-border)]",
          "bg-[color:var(--glass-bg-hover)] px-1.5 py-0.5 text-[9px] font-medium leading-none",
          PROJECT_DISPLAY_STATUS_MINIMAL_TEXT[status],
          className
        )}
      >
        <span
          className={cn(
            "h-1 w-1 shrink-0 rounded-full",
            PROJECT_DISPLAY_STATUS_ACCENT[status]
          )}
          aria-hidden
        />
        {PROJECT_DISPLAY_STATUS_LABELS[status]}
      </span>
    );
  }

  const listPill =
    context === "list"
      ? PROJECT_LIST_DEADLINE_PILL[status]
      : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border",
        context === "card" && "backdrop-blur-md shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.28)]",
        context === "list" && "font-semibold",
        size === "sm"
          ? context === "list"
            ? "gap-1 px-2 py-0.5 text-[10px]"
            : "gap-1 px-2 py-0.5 text-[9px]"
          : "gap-1.5 px-2.5 py-1 text-[10px]",
        listPill ?? PROJECT_DISPLAY_STATUS_PILL[status],
        className
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full shadow-[0_0_6px_currentColor]",
          size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5",
          PROJECT_DISPLAY_STATUS_ACCENT[status]
        )}
        aria-hidden
      />
      {PROJECT_DISPLAY_STATUS_LABELS[status]}
    </span>
  );
}

export function ProjectCardPlaceholder({
  compact,
  dashboard,
}: {
  compact?: boolean;
  dashboard?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-1.5",
        dashboard
          ? "bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent"
          : "bg-gradient-to-br from-studio-light/[0.08] via-white/[0.02] to-[#0c0c10]"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />
      <Building2
        className={cn("text-studio-light/25", compact ? "h-6 w-6" : "h-8 w-8")}
        strokeWidth={1.25}
      />
      {!compact && (
        <span className="text-[10px] font-medium tracking-wide text-glass-muted">Aperçu projet</span>
      )}
    </div>
  );
}

interface ProjectCardMediaProps {
  project: Project;
  href: string;
  aspectClass?: string;
  compact?: boolean;
  showBadge?: boolean;
  disableLink?: boolean;
  /** Cercle de progression en haut à droite (dashboard) */
  imageProgress?: number;
  /** Overlays légers sans fondu bleu vers le contenu */
  variant?: "default" | "dashboard";
  children?: React.ReactNode;
}

export function ProjectCardMedia({
  project,
  href,
  aspectClass = "aspect-[16/10]",
  compact,
  showBadge = true,
  disableLink,
  imageProgress,
  variant = "default",
  children,
}: ProjectCardMediaProps) {
  const imageSrc = resolveMediaUrl(project.imageUrl);
  const displayStatus = getProjectDisplayStatus(project);
  const isDashboard = variant === "dashboard";
  const progress =
    imageProgress !== undefined && Number.isFinite(imageProgress) ? imageProgress : undefined;

  const imageContent = imageSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt={project.name}
      className={cn(
        "h-full w-full object-cover transition duration-500 ease-out",
        isDashboard ? "group-hover/card:scale-[1.04]" : "group-hover/card:scale-[1.018]"
      )}
    />
  ) : (
    <ProjectCardPlaceholder compact={compact} dashboard={isDashboard} />
  );

  return (
    <div className={cn("relative shrink-0 overflow-hidden", aspectClass)}>
      {disableLink ? (
        <div className="absolute inset-0 z-0">{imageContent}</div>
      ) : (
        <Link href={href} className="absolute inset-0 z-0 block">
          {imageContent}
        </Link>
      )}

      {isDashboard ? (
        <>
          <div className={dashboardProjectCardImageOverlayTop} />
          <div className={dashboardProjectCardImageOverlayBottom} />
        </>
      ) : (
        <>
          <div className={projectCardImageOverlayBottom} />
          <div className={projectCardImageOverlayTop} />
          <div className={projectCardImageFadeIntoContent} />
        </>
      )}

      {showBadge && (
        <div
          className={cn(
            "pointer-events-none absolute z-[1]",
            isDashboard ? "left-2.5 top-2.5" : "left-3 top-3"
          )}
        >
          <ProjectStatusBadge
            status={displayStatus}
            size={isDashboard ? "sm" : "md"}
            className={
              isDashboard
                ? "shadow-md ring-1 ring-black/10 dark:border-white/12 dark:bg-black/35 dark:shadow-none dark:ring-0"
                : undefined
            }
          />
        </div>
      )}

      {progress !== undefined && (
        <div className="absolute right-3 top-3 z-[2] pointer-events-auto">
          <ProjectProgressRing progress={progress} variant="dashboard" showTooltip />
        </div>
      )}

      {children}
    </div>
  );
}

interface ProjectCardImageActionsProps {
  project: Project;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onQuickDeadline: (e: React.MouseEvent) => void;
  onEdit?: () => void;
  onQuickAdd?: (mode: ProjectMenuQuickAdd, project: Project) => void;
}

export function ProjectCardImageActions({
  project,
  onToggleFavorite,
  onQuickDeadline,
  onEdit,
  onQuickAdd,
}: ProjectCardImageActionsProps) {
  return (
    <>
      <div className="absolute right-3 top-3 z-10">
        <Tooltip label={project.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
          <button
            type="button"
            onClick={onToggleFavorite}
            className={projectCardActionBtn}
            aria-label={project.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                project.isFavorite
                  ? "fill-amber-400 text-amber-400"
                  : "text-[color:var(--pc-overlay-btn-color)]"
              )}
            />
          </button>
        </Tooltip>
      </div>

      <div className="absolute bottom-2 right-2 z-10">
        <div className={projectCardImageActionGroup}>
          <IconActionButton
            label="Ouvrir le projet"
            icon={ExternalLink}
            tone="view"
            href={`/projects/${project.id}`}
          />
          {onEdit && (
            <IconActionButton
              label="Modifier"
              icon={Pencil}
              tone="notes"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
            />
          )}
          <IconActionButton
            label="Ajouter une deadline"
            icon={CalendarPlus}
            tone="upload"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickDeadline(e);
            }}
          />
          <ProjectCardMenu
            project={project}
            variant="list"
            onEdit={onEdit}
            onQuickAdd={onQuickAdd}
            triggerClassName={cn(detailIconActionBtn, "!h-7 !w-7 !rounded-md")}
          />
        </div>
      </div>
    </>
  );
}

export function ProjectProgressRing({
  progress,
  compact,
  variant = "default",
  showTooltip = true,
}: {
  progress: number;
  status?: ProjectDisplayStatus;
  compact?: boolean;
  variant?: "default" | "dashboard";
  showTooltip?: boolean;
}) {
  const safeProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
  const isZero = safeProgress === 0;
  const isDashboard = variant === "dashboard";
  const size = isDashboard ? 34 : compact ? 30 : 36;
  const strokeWidth = isDashboard ? 2.75 : compact ? 2.5 : 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeProgress / 100) * circumference;
  const strokeColor = getProjectProgressRingStroke(safeProgress);
  const center = size / 2;
  const ariaLabel = `Progression ${safeProgress}%`;

  const ring = (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--pc-progress-track)"
          strokeWidth={strokeWidth}
        />
        {!isZero && strokeColor !== "transparent" && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        )}
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center tabular-nums leading-none font-semibold",
          isZero
            ? "text-[color:var(--pc-progress-text-zero)]"
            : isDashboard
              ? "text-glass-secondary"
              : "text-[color:var(--pc-progress-text)]",
          isDashboard ? "text-[8px]" : compact ? "text-[8px]" : "text-[9px]"
        )}
      >
        {safeProgress}%
      </span>
    </div>
  );

  if (showTooltip) {
    return <Tooltip label="Progression du projet">{ring}</Tooltip>;
  }

  return ring;
}

export function ProjectCardProgress({
  progress,
  status,
  showLabel,
  compact,
  className,
}: {
  progress: number;
  status: ProjectDisplayStatus;
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center",
        showLabel && !compact ? "justify-between gap-2" : "justify-end",
        compact && "justify-start",
        className
      )}
    >
      {showLabel && !compact && (
        <span className="text-[10px] font-medium text-glass-muted">Progression</span>
      )}
      <ProjectProgressRing progress={progress} status={status} compact={compact} />
    </div>
  );
}

export function ProjectCardLocationRow({
  siteLabel,
  fullAddress,
  mapsUrl,
  showMap,
  compact,
}: {
  siteLabel: string;
  fullAddress?: string;
  mapsUrl: string | null;
  showMap: boolean;
  compact?: boolean;
}) {
  const addressTooltip = fullAddress && fullAddress !== siteLabel ? fullAddress : siteLabel;
  const isUndefined = siteLabel === "Adresse non définie";

  return (
    <div className={cn("flex min-w-0 items-center gap-2", compact ? "mt-1.5" : "mt-2")}>
      <MapPin
        className="h-3 w-3 shrink-0 text-[color:var(--pc-accent)]"
        strokeWidth={1.75}
        aria-hidden
      />
      <Tooltip label={addressTooltip}>
        <p
          className={cn(
            "min-w-0 flex-1 truncate",
            isUndefined ? "text-glass-muted" : "text-glass-muted",
            compact ? "text-[10px]" : "text-[11px] leading-snug"
          )}
        >
          {siteLabel}
        </p>
      </Tooltip>
      {showMap && mapsUrl && (
        <Tooltip label="Ouvrir sur Google Maps">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-md",
              "border border-[color:var(--studio-border)] bg-studio-muted px-1.5 py-0.5",
              "text-[10px] font-medium text-studio-light transition duration-200",
              "hover:border-[color:var(--studio-border)] hover:bg-studio-soft hover:text-studio-light"
            )}
            aria-label="Voir le site sur Google Maps"
            title="Voir sur Google Maps"
            onClick={(e) => e.stopPropagation()}
          >
            Carte
            <ExternalLink className="h-2.5 w-2.5 opacity-70" strokeWidth={2} />
          </a>
        </Tooltip>
      )}
    </div>
  );
}

export function ProjectCardFooterCounts({ project }: { project: Project }) {
  return (
    <ProjectCountIndicators
      project={project}
      compact
      showTooltips
      tooltipStyle="named"
      className="gap-1"
    />
  );
}

export function ProjectCardOpenHint() {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-studio-light/75 opacity-0 transition duration-200 group-hover/card:opacity-100">
      Ouvrir
      <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
    </span>
  );
}
