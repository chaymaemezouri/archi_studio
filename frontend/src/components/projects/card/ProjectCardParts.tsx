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
import { detailIconActionGroup } from "../detail/project-detail-ui";
import ProjectCountIndicators from "../ProjectCountIndicators";
import {
  getProjectDisplayStatus,
  getProjectProgressRingStroke,
  PROJECT_DISPLAY_STATUS_ACCENT,
  PROJECT_DISPLAY_STATUS_LABELS,
  PROJECT_DISPLAY_STATUS_PILL,
  type ProjectDisplayStatus,
} from "@/lib/project-status";
import { resolveMediaUrl } from "@/lib/assets";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import {
  dashboardProjectCardImageOverlayBottom,
  dashboardProjectCardImageOverlayTop,
  projectCardActionBtn,
  projectCardImageFadeIntoContent,
  projectCardImageOverlayBottom,
  projectCardImageOverlayTop,
} from "./project-card-styles";

import type { ProjectMenuQuickAdd } from "../ProjectCardMenu";

export function ProjectStatusBadge({
  status,
  className,
  size = "md",
}: {
  status: ProjectDisplayStatus;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md",
        "font-medium leading-none shadow-[0_2px_10px_rgba(0,0,0,0.28)]",
        size === "sm" ? "gap-1 px-2 py-0.5 text-[9px]" : "gap-1.5 px-2.5 py-1 text-[10px]",
        PROJECT_DISPLAY_STATUS_PILL[status],
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
        <span className="text-[10px] font-medium tracking-wide text-white/30">Aperçu projet</span>
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
            className={isDashboard ? "border-white/12 bg-black/35 shadow-none" : undefined}
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
                project.isFavorite ? "fill-amber-400 text-amber-400" : ""
              )}
            />
          </button>
        </Tooltip>
      </div>

      <div className="absolute bottom-2 right-2 z-10">
        <div className={cn(detailIconActionGroup, "bg-black/45 backdrop-blur-md")}>
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
          <Tooltip label="Ajouter une deadline">
            <button
              type="button"
              onClick={onQuickDeadline}
              className={projectCardActionBtn}
              aria-label="Ajouter une deadline"
            >
              <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </Tooltip>
          <ProjectCardMenu
            project={project}
            variant="list"
            onEdit={onEdit}
            onQuickAdd={onQuickAdd}
            triggerClassName={cn(projectCardActionBtn, "!rounded-lg !h-6 !w-6")}
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
          stroke={isZero ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)"}
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
          isZero ? "text-white/26" : isDashboard ? "text-white/75" : "text-white/62",
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
        <span className="text-[10px] font-medium text-white/38">Progression</span>
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
        className="h-3 w-3 shrink-0 text-studio-light/60"
        strokeWidth={1.75}
        aria-hidden
      />
      <Tooltip label={addressTooltip}>
        <p
          className={cn(
            "min-w-0 flex-1 truncate",
            isUndefined ? "text-white/32" : "text-white/55",
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
              "border border-studio-light/20 bg-studio-light/[0.06] px-1.5 py-0.5",
              "text-[10px] font-medium text-studio-light/75 transition duration-200",
              "hover:border-studio-border/50 hover:bg-studio-muted/50 hover:text-studio-light"
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
