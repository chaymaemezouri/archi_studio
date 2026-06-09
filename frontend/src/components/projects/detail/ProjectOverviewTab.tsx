"use client";

import { Calendar, Check, Circle, Plus } from "lucide-react";
import DeadlineStatusBadge from "@/components/dashboard/DeadlineStatusBadge";
import IconActionButton from "./IconActionButton";
import ProjectOverviewChecklist from "./ProjectOverviewChecklist";
import {
  detailCaption,
  detailLink,
  detailOverviewBlockTitle,
  detailOverviewCard,
  detailOverviewCardFooter,
  detailOverviewCardHeader,
  detailOverviewDeadlineCard,
  detailOverviewEmptyInline,
  detailOverviewGrid,
  detailPhaseStepConnector,
  detailPhaseStepCurrent,
  detailPhaseStepPercent,
  detailPhaseStepPercentCurrent,
  detailPhaseStepRow,
  detailTextStrong,
} from "./project-detail-ui";
import {
  getPhaseIndex,
  getPhaseProgressPercent,
  getProjectDetailPhases,
  phaseLabel,
} from "@/lib/project-detail";
import {
  DEADLINE_DISPLAY_LABELS,
  DEADLINE_DISPLAY_STYLES,
  getDeadlineDisplayUrgency,
} from "@/lib/dates";
import type { Project, ProjectPhase } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import type { ProjectTabId } from "./project-detail-nav";
import type { ProjectQuickAddMode } from "./project-detail-types";

interface ProjectOverviewTabProps {
  project: Project;
  onTabChange: (tab: ProjectTabId) => void;
  onQuickAdd: (mode: ProjectQuickAddMode) => void;
}

function PhaseStepIndicator({
  isComplete,
  isCurrent,
  isLast,
}: {
  isComplete: boolean;
  isCurrent: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex w-3 shrink-0 flex-col items-center pt-0.5">
      {isComplete && !isCurrent ? (
        <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500/8">
          <Check className="h-1.5 w-1.5 text-emerald-400/70" strokeWidth={3} />
        </span>
      ) : isCurrent ? (
        <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-studio-muted ring-1 ring-[color:var(--studio-border)]">
          <span className="h-1 w-1 rounded-full bg-[#8ba4c7]/75" />
        </span>
      ) : (
        <Circle className="h-2 w-2 text-white/10" strokeWidth={1.5} />
      )}
      {!isLast && <div className={detailPhaseStepConnector} aria-hidden />}
    </div>
  );
}

function PhaseStepper({
  project,
  phases,
}: {
  project: Project;
  phases: ProjectPhase[];
}) {
  const currentIdx = getPhaseIndex(project.phase, phases);

  return (
    <ul>
      {phases.map((phase, i) => {
        const idx = getPhaseIndex(phase, phases);
        const percent = getPhaseProgressPercent(
          phase,
          project.phase,
          project.progress,
          project.phaseProgress,
          phases
        );
        const isCurrent = phase === project.phase;
        const isPast = idx >= 0 && currentIdx >= 0 && idx < currentIdx;
        const isComplete = percent >= 100 || isPast;
        const isLast = i === phases.length - 1;

        const percentLabel =
          isComplete && !isCurrent ? "100%" : isCurrent ? `${percent}%` : "—";

        return (
          <li
            key={phase}
            className={cn(detailPhaseStepRow, isCurrent && detailPhaseStepCurrent)}
          >
            <PhaseStepIndicator
              isComplete={isComplete}
              isCurrent={isCurrent}
              isLast={isLast}
            />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span
                className={cn(
                  "truncate text-[11px] leading-snug",
                  isCurrent
                    ? "font-medium text-white/86"
                    : isComplete
                      ? "text-glass-muted"
                      : "text-white/24"
                )}
              >
                {phaseLabel(phase)}
              </span>
              <span
                className={cn(
                  detailPhaseStepPercent,
                  isCurrent && detailPhaseStepPercentCurrent
                )}
              >
                {percentLabel}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function ProjectOverviewTab({
  project,
  onTabChange,
  onQuickAdd,
}: ProjectOverviewTabProps) {
  const detailPhases = getProjectDetailPhases(project);

  const nextDeadline = (project.deadlines ?? [])
    .filter((d) => !d.done)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const displayUrgency = nextDeadline
    ? getDeadlineDisplayUrgency(nextDeadline.date, nextDeadline.done)
    : null;

  return (
    <div className={detailOverviewGrid}>
      <div className={detailOverviewCard}>
        <div className={detailOverviewCardHeader}>
          <h3 className={detailOverviewBlockTitle}>Progression par phase</h3>
        </div>
        <PhaseStepper project={project} phases={detailPhases} />
      </div>

      <ProjectOverviewChecklist project={project} onTabChange={onTabChange} />

      <div className={cn(detailOverviewCard, "sm:col-span-2 lg:col-span-1")}>
        <div className={detailOverviewCardHeader}>
          <h3 className={detailOverviewBlockTitle}>Prochaine deadline</h3>
          <IconActionButton
            label="Ajouter une deadline"
            icon={Plus}
            onClick={() => onQuickAdd("deadline")}
          />
        </div>

        {nextDeadline ? (
          <div className={detailOverviewDeadlineCard}>
            <div className="flex items-start justify-between gap-2">
              <p className={cn(detailTextStrong, "line-clamp-2 text-[12px] leading-snug text-white/86")}>
                {nextDeadline.title}
              </p>
              {displayUrgency ? (
                <span
                  className={cn(
                    "shrink-0 rounded px-1 py-px text-[7px] font-medium uppercase tracking-wide opacity-90",
                    DEADLINE_DISPLAY_STYLES[displayUrgency]
                  )}
                >
                  {DEADLINE_DISPLAY_LABELS[displayUrgency]}
                </span>
              ) : (
                <DeadlineStatusBadge
                  date={nextDeadline.date}
                  done={nextDeadline.done}
                  className="shrink-0 scale-[0.85] opacity-75"
                />
              )}
            </div>
            <p className={cn(detailCaption, "mt-1.5 flex items-center gap-1 text-[10px] text-[#8ba4c7]/58")}>
              <Calendar className="h-2.5 w-2.5 shrink-0 opacity-65" />
              {formatDate(nextDeadline.date, "d MMMM yyyy")}
            </p>
          </div>
        ) : (
          <div className={detailOverviewEmptyInline}>
            <Calendar className="h-3 w-3 text-white/16" aria-hidden />
            <span>Aucune deadline à venir</span>
          </div>
        )}

        <div className={detailOverviewCardFooter}>
          <button
            type="button"
            onClick={() => onTabChange("planning")}
            className={cn(detailLink, "text-[10px] text-white/34 hover:text-glass-muted")}
          >
            Voir toutes les deadlines
          </button>
        </div>
      </div>
    </div>
  );
}
