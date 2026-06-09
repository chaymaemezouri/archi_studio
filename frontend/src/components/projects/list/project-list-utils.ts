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

/** Pills deadline vue liste — plus saturés sur fond blanc */
export const PROJECT_LIST_DEADLINE_PILL: Partial<
  Record<ProjectDisplayStatus, string>
> = {
  overdue:
    "border-red-400 bg-red-100 text-red-900 ring-1 ring-inset ring-red-300 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-200/90 dark:ring-transparent",
  today:
    "border-orange-400 bg-orange-100 text-orange-900 ring-1 ring-inset ring-orange-300 dark:border-orange-400/25 dark:bg-orange-500/10 dark:text-orange-200/90 dark:ring-transparent",
  tomorrow:
    "border-amber-300 bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200 dark:border-yellow-400/25 dark:bg-yellow-500/10 dark:text-yellow-100/90 dark:ring-transparent",
  soon:
    "border-sky-300 bg-sky-50 text-sky-900 ring-1 ring-inset ring-sky-200 dark:border-amber-400/22 dark:bg-amber-500/10 dark:text-amber-100/85 dark:ring-transparent",
  delivered:
    "border-emerald-400 bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-300 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-200/90 dark:ring-transparent",
};

/** Accent gauche discret — couleur seulement (largeur constante) */
export function getListRowAccentBorder(overdue: boolean, delivered: boolean): string {
  if (overdue) return "border-l-red-400/35";
  if (delivered) return "border-l-emerald-400/30";
  return "border-l-transparent";
}

export const projectListRowBorder = "border-l-2";
