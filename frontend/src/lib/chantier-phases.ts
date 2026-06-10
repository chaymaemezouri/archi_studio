export const CHANTIER_PHASE_OPTIONS = [
  "Démarrage",
  "Terrassement",
  "Gros œuvre",
  "Second œuvre",
  "Finitions",
  "Réception",
  "Autre",
] as const;

export type ChantierPhase = (typeof CHANTIER_PHASE_OPTIONS)[number];
