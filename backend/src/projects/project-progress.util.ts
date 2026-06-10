import {
  ChecklistItemStatus,
  ProjectCategory,
  ProjectPhase,
} from '@prisma/client';

const PRIVATE_PHASES: ProjectPhase[] = [
  'ESQUISSE',
  'AUTORISATION',
  'DOSSIER_EXECUTION',
];

const PUBLIC_PHASES: ProjectPhase[] = [
  'CONSULTATION',
  'APS',
  'APD',
  'CPS',
  'AUTORISATION',
  'DOSSIER_EXECUTION',
];

export function getPhasesForCategory(
  category?: ProjectCategory | null,
): ProjectPhase[] {
  if (category === ProjectCategory.PUBLIC || category === ProjectCategory.STATE) {
    return PUBLIC_PHASES;
  }
  return PRIVATE_PHASES;
}

export function getDetailPhasesForProject(
  category?: ProjectCategory | null,
  currentPhase?: ProjectPhase,
): ProjectPhase[] {
  const allowed = getPhasesForCategory(category);
  if (currentPhase && !allowed.includes(currentPhase)) {
    return [currentPhase, ...allowed.filter((phase) => phase !== currentPhase)];
  }
  return allowed;
}

export function getCurrentPhaseProgress(
  phase: ProjectPhase,
  phaseProgress: { phase: ProjectPhase; progress: number }[] = [],
): number {
  const entry = phaseProgress.find((item) => item.phase === phase)?.progress;
  if (entry == null) return 0;
  return Math.max(0, Math.min(100, entry));
}

export function computeOverallProgress(input: {
  phase: ProjectPhase;
  projectCategory?: ProjectCategory | null;
  phaseProgress?: { phase: ProjectPhase; progress: number }[];
  checklistItems?: { status: ChecklistItemStatus }[];
}): number {
  const phases = getDetailPhasesForProject(input.projectCategory, input.phase);
  const totalPhases = phases.length;
  if (totalPhases === 0) return 0;

  const currentIdx = phases.indexOf(input.phase);
  if (currentIdx < 0) return 0;

  const inPhase = getCurrentPhaseProgress(input.phase, input.phaseProgress);
  const fromPhases =
    ((currentIdx + inPhase / 100) / totalPhases) * 100;

  const items = input.checklistItems ?? [];
  const totalChecklist = items.length;
  const added = items.filter(
    (item) =>
      item.status === ChecklistItemStatus.UPLOADED ||
      item.status === ChecklistItemStatus.VALIDATED,
  ).length;
  const checklistPct =
    totalChecklist > 0 ? (added / totalChecklist) * 100 : 0;

  return Math.round(Math.max(fromPhases, checklistPct));
}
