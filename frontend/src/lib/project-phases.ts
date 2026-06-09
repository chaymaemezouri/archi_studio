import type { ProjectCategory, ProjectPhase } from "@/types";
import { PHASE_LABELS } from "@/types";

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  PRIVATE: "Projet privé",
  PUBLIC: "Projet public",
  STATE: "Projet étatique",
};

export const PROJECT_CATEGORY_SHORT_LABELS: Record<ProjectCategory, string> = {
  PRIVATE: "Privé",
  PUBLIC: "Public",
  STATE: "Étatique",
};

export const PROJECT_SCALE_LABELS = {
  SMALL: "Petit projet",
  LARGE: "Grand projet",
} as const;

export const PROJECT_SCALE_SHORT_LABELS = {
  SMALL: "Petit",
  LARGE: "Grand",
} as const;

export const PROJECT_NATURE_OPTIONS = [
  "Architecture",
  "Lotissement",
  "Tertiaire",
  "Résidentiel",
  "Réhabilitation",
  "Aménagement intérieur",
  "Extension",
  "Concours",
  "Équipement public",
  "Autre",
] as const;

const PRIVATE_PHASES: ProjectPhase[] = [
  "ESQUISSE",
  "AUTORISATION",
  "DOSSIER_EXECUTION",
];

const PUBLIC_PHASES: ProjectPhase[] = [
  "CONSULTATION",
  "APS",
  "APD",
  "CPS",
  "AUTORISATION",
  "DOSSIER_EXECUTION",
];

export const LEGACY_PHASES: ProjectPhase[] = [
  "DCE",
  "EXECUTION",
  "CHANTIER",
  "LIVRE",
];

export function getPhasesForCategory(
  category?: ProjectCategory | null
): ProjectPhase[] {
  if (category === "PUBLIC" || category === "STATE") return PUBLIC_PHASES;
  return PRIVATE_PHASES;
}

export function normalizePhaseForCategory(
  phase: ProjectPhase,
  category: ProjectCategory
): ProjectPhase {
  const allowed = getPhasesForCategory(category);
  if (allowed.includes(phase)) return phase;

  const legacyMap: Partial<Record<ProjectPhase, ProjectPhase>> = {
    DCE: "DOSSIER_EXECUTION",
    EXECUTION: "DOSSIER_EXECUTION",
    CHANTIER: "DOSSIER_EXECUTION",
    LIVRE: "DOSSIER_EXECUTION",
    ESQUISSE: "ESQUISSE",
    APS: "APS",
    APD: "APD",
    CONSULTATION: "CONSULTATION",
    CPS: "CPS",
    AUTORISATION: "AUTORISATION",
    DOSSIER_EXECUTION: "DOSSIER_EXECUTION",
  };

  const mapped = legacyMap[phase];
  if (mapped && allowed.includes(mapped)) return mapped;
  return allowed[0];
}

export function getPhaseOptionsForCategory(
  category?: ProjectCategory | null,
  currentPhase?: ProjectPhase
) {
  const allowed = getPhasesForCategory(category);
  const options = allowed.map((value) => ({
    value,
    label: PHASE_LABELS[value],
  }));

  if (
    currentPhase &&
    !allowed.includes(currentPhase) &&
    PHASE_LABELS[currentPhase]
  ) {
    options.unshift({
      value: currentPhase,
      label: `${PHASE_LABELS[currentPhase]} (historique)`,
    });
  }

  return options;
}

export function getDetailPhasesForProject(
  category?: ProjectCategory | null,
  currentPhase?: ProjectPhase
): ProjectPhase[] {
  const allowed = getPhasesForCategory(category);
  if (currentPhase && !allowed.includes(currentPhase)) {
    return [currentPhase, ...allowed.filter((p) => p !== currentPhase)];
  }
  return allowed;
}

export const ALL_FILTER_PHASES: ProjectPhase[] = [
  ...PRIVATE_PHASES,
  ...PUBLIC_PHASES.filter((p) => !PRIVATE_PHASES.includes(p)),
  ...LEGACY_PHASES,
];
