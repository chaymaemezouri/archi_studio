import { getProjectDetailPhases, getPhaseIndex, getChecklistStats } from "@/lib/project-detail";
import type { Project } from "@/types";

export function getCurrentPhaseProgress(project: Project): number {
  const entry = project.phaseProgress?.find((item) => item.phase === project.phase)
    ?.progress;
  if (entry == null) return 0;
  return Math.max(0, Math.min(100, entry));
}

/** Progression globale affichée (phase courante + checklist admin.). */
export function computeProjectOverallProgress(project: Project): number {
  const phases = getProjectDetailPhases(project);
  const totalPhases = phases.length;
  if (totalPhases === 0) return Math.max(0, Math.min(100, project.progress ?? 0));

  const currentIdx = getPhaseIndex(project.phase, phases);
  if (currentIdx < 0) return Math.max(0, Math.min(100, project.progress ?? 0));

  const inPhase = getCurrentPhaseProgress(project);
  const fromPhases = ((currentIdx + inPhase / 100) / totalPhases) * 100;

  const stats = getChecklistStats(project);
  const checklistPct =
    stats.total > 0 ? Math.round((stats.added / stats.total) * 100) : 0;

  const computed = Math.round(Math.max(fromPhases, checklistPct));
  if (computed > 0) return computed;

  return Math.max(0, Math.min(100, project.progress ?? 0));
}
