"use client";

import { cn } from "@/lib/utils";
import { PHASE_LABELS, type ProjectPhase } from "@/types";

const PHASES: ProjectPhase[] = [
  "ESQUISSE",
  "APS",
  "APD",
  "DCE",
  "EXECUTION",
  "CHANTIER",
  "LIVRE",
];

interface ProjectPhaseBarProps {
  currentPhase: ProjectPhase;
  phaseProgress?: { phase: ProjectPhase; progress: number }[];
}

export default function ProjectPhaseBar({ currentPhase, phaseProgress = [] }: ProjectPhaseBarProps) {
  const currentIndex = PHASES.indexOf(currentPhase);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {PHASES.map((phase, index) => {
          const progress = phaseProgress.find((p) => p.phase === phase)?.progress ?? 0;
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;

          return (
            <div key={phase} className="flex flex-1 flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isActive && "bg-accent text-white",
                  isPast && "bg-emerald-500/20 text-emerald-400",
                  !isActive && !isPast && "bg-dark-elevated text-text-muted"
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "mt-2 hidden text-center text-xs sm:block",
                  isActive ? "font-medium text-accent" : "text-text-secondary"
                )}
              >
                {PHASE_LABELS[phase]}
              </span>
              {isActive && progress > 0 && (
                <span className="mt-1 text-xs text-text-muted">{progress}%</span>
              )}
              {index < PHASES.length - 1 && (
                <div
                  className={cn(
                    "absolute hidden h-0.5 sm:block",
                    isPast ? "bg-emerald-500/40" : "bg-dark-border"
                  )}
                  style={{ display: "none" }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-1">
        {PHASES.map((phase, index) => (
          <div
            key={phase}
            className={cn(
              "h-1 flex-1 rounded-full",
              index <= currentIndex ? "bg-accent" : "bg-dark-elevated"
            )}
          />
        ))}
      </div>
    </div>
  );
}

