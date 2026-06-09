import {
  PROJECT_DISPLAY_STATUS_PROGRESS,
  type ProjectDisplayStatus,
} from "@/lib/project-status";

/** Couleur barre progression — vue liste */
export function getListProgressBarColor(status: ProjectDisplayStatus): string {
  if (status === "delivered") return "bg-emerald-400/90";
  if (status === "overdue") return "bg-red-400/85";
  if (status === "today" || status === "tomorrow") return "bg-orange-400/90";
  return PROJECT_DISPLAY_STATUS_PROGRESS.in_progress;
}

export function listProgressBarClass(status: ProjectDisplayStatus): string {
  return getListProgressBarColor(status);
}

/** Badges deadline : Aujourd'hui, Demain, Bientôt, En retard, Livré */
export const LIST_DEADLINE_BADGE_STATUSES: ProjectDisplayStatus[] = [
  "overdue",
  "today",
  "tomorrow",
  "soon",
  "delivered",
];

export function shouldShowDeadlineBadge(status: ProjectDisplayStatus): boolean {
  return LIST_DEADLINE_BADGE_STATUSES.includes(status);
}

/** Accent gauche discret — couleur seulement (largeur constante) */
export function getListRowAccentBorder(overdue: boolean, delivered: boolean): string {
  if (overdue) return "border-l-red-400/35";
  if (delivered) return "border-l-emerald-400/30";
  return "border-l-transparent";
}

export const projectListRowBorder = "border-l-2";
