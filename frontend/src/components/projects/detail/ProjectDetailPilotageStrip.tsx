"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import {
  detailMenu,
  detailMenuItem,
  detailPilotageCell,
  detailPilotageLabel,
  detailPilotageProgressBlock,
  detailPilotageProgressFill,
  detailPilotageProgressTrack,
  detailPilotageProgressValue,
  detailMenuItemActive,
  detailPilotageChevron,
  detailPilotageDeadlineIcon,
  detailPilotageDeadlineValue,
  detailPilotageSelect,
  detailPilotageStrip,
  detailPilotageValue,
} from "./project-detail-ui";
import { ProjectStatusBadge } from "../card/ProjectCardParts";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
import {
  getNextTaskForProject,
  getProjectDisplayStatus,
} from "@/lib/project-status";
import { getPhaseOptionsForCategory } from "@/lib/project-phases";
import type { Project, ProjectPhase } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import type { ProjectTabId } from "./ProjectDetailTabs";

interface PilotagePhaseSelectProps {
  value: ProjectPhase;
  options: { value: ProjectPhase; label: string }[];
  onChange: (phase: ProjectPhase) => void;
  "aria-label"?: string;
}

function PilotagePhaseSelect({
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
}: PilotagePhaseSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(detailPilotageSelect, "flex w-full cursor-pointer items-center text-left")}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
      </button>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 transition",
          detailPilotageChevron,
          open && "rotate-180"
        )}
        aria-hidden
      />
      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            detailMenu,
            "absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto py-1"
          )}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                detailMenuItem,
                "text-[12px] font-medium",
                o.value === value && detailMenuItemActive
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProjectDetailPilotageStripProps {
  project: Project;
  onTabChange: (tab: ProjectTabId) => void;
}

export default function ProjectDetailPilotageStrip({
  project,
  onTabChange,
}: ProjectDetailPilotageStripProps) {
  const { updateProjectMeta } = useProjectDetailMutations(project.id);
  const displayStatus = getProjectDisplayStatus(project);
  const progress = project.progress ?? 0;
  const phases = getPhaseOptionsForCategory(
    project.projectCategory ?? "PRIVATE",
    project.phase
  );
  const nextTask = getNextTaskForProject(project.id, project.tasks ?? []);

  return (
    <div className={detailPilotageStrip} role="region" aria-label="Pilotage du projet">
      <div className={detailPilotageCell}>
        <span className={detailPilotageLabel}>Phase</span>
        <PilotagePhaseSelect
          value={project.phase}
          options={phases}
          onChange={(phase) => updateProjectMeta.mutate({ phase })}
          aria-label="Phase du projet"
        />
      </div>

      <div className={detailPilotageCell}>
        <span className={detailPilotageLabel}>Statut</span>
        <div className="w-fit">
          <ProjectStatusBadge status={displayStatus} size="sm" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onTabChange("planning")}
        className={cn(
          detailPilotageCell,
          "text-left transition-colors hover:bg-white/[0.015] sm:rounded-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-light/20"
        )}
      >
        <span className={detailPilotageLabel}>Deadline</span>
        <span
          className={cn(
            detailPilotageValue,
            "inline-flex items-center gap-1.5",
            project.deadline && detailPilotageDeadlineValue
          )}
        >
          <Calendar
            className={cn(
              "h-3 w-3 shrink-0",
              project.deadline ? detailPilotageDeadlineIcon : detailPilotageChevron
            )}
            aria-hidden
          />
          {project.deadline
            ? formatDate(project.deadline, "d MMM yyyy")
            : "Non définie"}
        </span>
      </button>

      <div className={cn(detailPilotageCell, "min-w-0 flex-1")}>
        <span className={detailPilotageLabel}>Prochaine action</span>
        <p className={cn(detailPilotageValue, "truncate")}>
          {nextTask?.title || "Non définie"}
        </p>
      </div>

      <div className={detailPilotageProgressBlock}>
        <div className="flex items-baseline justify-between gap-2">
          <span className={detailPilotageLabel}>Progression</span>
          <span className={detailPilotageProgressValue}>{progress}%</span>
        </div>
        <div className={detailPilotageProgressTrack}>
          <div
            className={detailPilotageProgressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
