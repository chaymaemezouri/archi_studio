import {
  isDeadlineSoon,
  isDeadlineToday,
  isOverdueDeadline,
  isUrgentDeadline,
} from "@/lib/dates";
import type { Deadline, Project, Task } from "@/types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type ProjectFilter = "all" | "urgent" | "overdue" | "recent";

export type ProjectDisplayStatus =
  | "archived"
  | "delivered"
  | "overdue"
  | "today"
  | "tomorrow"
  | "soon"
  | "urgent"
  | "new"
  | "in_progress";

/** @deprecated use ProjectDisplayStatus — kept for dashboard cards */
export type ProjectStatusBadge = "new" | "urgent" | "overdue" | "in_progress";

export function getProjectNextDeadline(project: Project): Deadline | null {
  const open = (project.deadlines ?? []).filter((d) => !d.done);
  if (open.length === 0) return null;
  return [...open].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

export function getProjectEffectiveDeadlineDate(project: Project): string | null {
  const next = getProjectNextDeadline(project);
  return next?.date ?? project.deadline ?? null;
}

export function isProjectArchived(project: Project): boolean {
  return project.status === "ARCHIVED";
}

export function isProjectDelivered(project: Project): boolean {
  return project.phase === "LIVRE";
}

export function isProjectNew(project: Project): boolean {
  return Date.now() - new Date(project.createdAt).getTime() < WEEK_MS;
}

export function isProjectOverdue(project: Project): boolean {
  if (isProjectArchived(project) || isProjectDelivered(project)) return false;
  const dl = getProjectNextDeadline(project);
  if (dl) return isOverdueDeadline(dl.date, dl.done);
  if (project.deadline) return isOverdueDeadline(project.deadline);
  return false;
}

export function hasUrgentOpenTasks(project: Project): boolean {
  return (project.tasks ?? []).some(
    (t) => t.status !== "DONE" && t.priority === "URGENT"
  );
}

export function isProjectUrgent(project: Project): boolean {
  if (isProjectArchived(project) || isProjectDelivered(project)) return false;
  if (hasUrgentOpenTasks(project)) return true;
  const dl = getProjectNextDeadline(project);
  if (dl && isUrgentDeadline(dl.date, dl.done) && !isOverdueDeadline(dl.date, dl.done)) {
    return true;
  }
  if (
    project.deadline &&
    isUrgentDeadline(project.deadline) &&
    !isOverdueDeadline(project.deadline)
  ) {
    return true;
  }
  return false;
}

export function isProjectRecent(project: Project): boolean {
  return Date.now() - new Date(project.updatedAt).getTime() < WEEK_MS;
}

export function getProjectDisplayStatus(project: Project): ProjectDisplayStatus {
  if (isProjectArchived(project)) return "archived";
  if (isProjectDelivered(project)) return "delivered";
  if (isProjectOverdue(project)) return "overdue";

  const dl = getProjectNextDeadline(project);
  const date = dl?.date ?? project.deadline;
  if (date && !dl?.done) {
    if (isOverdueDeadline(date, dl?.done)) return "overdue";
    if (isDeadlineToday(date, dl?.done)) return "today";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const d = new Date(date);
    if (
      d.getFullYear() === tomorrow.getFullYear() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getDate() === tomorrow.getDate()
    ) {
      return "tomorrow";
    }
    if (isDeadlineSoon(date, dl?.done)) return "soon";
  }

  if (isProjectUrgent(project)) return "urgent";
  if (isProjectNew(project)) return "new";
  return "in_progress";
}

export function getProjectStatusBadge(project: Project): ProjectStatusBadge {
  const status = getProjectDisplayStatus(project);
  if (status === "overdue") return "overdue";
  if (status === "urgent" || status === "today" || status === "tomorrow" || status === "soon") {
    return "urgent";
  }
  if (status === "new") return "new";
  return "in_progress";
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatusBadge, string> = {
  new: "Nouveau",
  urgent: "Urgent",
  overdue: "En retard",
  in_progress: "En cours",
};

export const PROJECT_DISPLAY_STATUS_LABELS: Record<ProjectDisplayStatus, string> = {
  archived: "Archivé",
  delivered: "Livré",
  overdue: "En retard",
  today: "Aujourd'hui",
  tomorrow: "Demain",
  soon: "Bientôt",
  urgent: "Urgent",
  new: "Nouveau",
  in_progress: "En cours",
};

export const PROJECT_STATUS_STYLES: Record<ProjectStatusBadge, string> = {
  new: "bg-sky-50 text-sky-700 ring-sky-100",
  urgent: "bg-orange-50 text-orange-700 ring-orange-100",
  overdue: "bg-red-50/90 text-red-700/90 ring-red-100",
  in_progress: "bg-stone-100 text-stone-600 ring-stone-200/80",
};

export const PROJECT_DISPLAY_STATUS_STYLES: Record<ProjectDisplayStatus, string> = {
  archived: "bg-stone-200 text-stone-700 ring-stone-300",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  overdue: "bg-red-50/90 text-red-700/90 ring-red-100",
  today: "bg-amber-50 text-amber-800 ring-amber-100",
  tomorrow: "bg-amber-50/80 text-amber-700 ring-amber-100",
  soon: "bg-sky-50 text-sky-800 ring-sky-100",
  urgent: "bg-orange-50 text-orange-700 ring-orange-100",
  new: "bg-sky-50 text-sky-700 ring-sky-100",
  in_progress: "bg-stone-100 text-stone-600 ring-stone-200/80",
};

/** Accent coloré (barre gauche / point) pour badges glass dashboard */
export const PROJECT_DISPLAY_STATUS_ACCENT: Record<ProjectDisplayStatus, string> = {
  archived: "bg-glass-muted dark:bg-white/35",
  delivered: "bg-emerald-400",
  overdue: "bg-red-400",
  today: "bg-orange-400",
  tomorrow: "bg-amber-500",
  soon: "bg-sky-500",
  urgent: "bg-orange-500",
  new: "bg-sky-400",
  in_progress: "bg-studio-light",
};

/** Pill statut — saturé en clair, inchangé en sombre */
export const PROJECT_DISPLAY_STATUS_PILL: Record<ProjectDisplayStatus, string> = {
  archived:
    "border-slate-300 bg-slate-100 text-slate-600 dark:border-glass dark:bg-black/30 dark:text-glass-muted",
  delivered:
    "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-200/90",
  overdue:
    "border-red-300 bg-red-100 text-red-800 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-200/90",
  today:
    "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-400/25 dark:bg-orange-500/10 dark:text-orange-200/90",
  tomorrow:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-yellow-400/25 dark:bg-yellow-500/10 dark:text-yellow-100/90",
  soon:
    "border-sky-200 bg-sky-50 text-sky-900 dark:border-amber-400/22 dark:bg-amber-500/10 dark:text-amber-100/85",
  urgent:
    "border-orange-400 bg-orange-100 text-orange-900 dark:border-orange-500/28 dark:bg-orange-600/10 dark:text-orange-100/90",
  new:
    "border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-400/25 dark:bg-sky-500/10 dark:text-sky-200/90",
  in_progress:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-white/12 dark:bg-studio-muted dark:text-white/58",
};

/** Couleur barre / arc de progression selon statut */
export const PROJECT_DISPLAY_STATUS_PROGRESS: Record<ProjectDisplayStatus, string> = {
  archived: "bg-white/40",
  delivered: "bg-emerald-400",
  overdue: "bg-red-400",
  today: "bg-orange-400",
  tomorrow: "bg-amber-500",
  soon: "bg-sky-400",
  urgent: "bg-orange-500",
  new: "bg-sky-400",
  in_progress: "bg-studio-light",
};

/** Couleur stroke SVG — arc circulaire */
export const PROJECT_DISPLAY_STATUS_PROGRESS_STROKE: Record<ProjectDisplayStatus, string> = {
  archived: "rgba(255,255,255,0.35)",
  delivered: "#34d399",
  overdue: "#f87171",
  today: "#fb923c",
  tomorrow: "#d97706",
  soon: "#0ea5e9",
  urgent: "#f97316",
  new: "#38bdf8",
  in_progress: "#8BA4C7",
};

/** Couleur arc progression circulaire — selon le % (vue grille) */
export function getProjectProgressRingStroke(progress: number): string {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
  if (p >= 100) return "#34d399";
  if (p >= 71) return "#8BA4C7";
  if (p >= 31) return "#fb923c";
  if (p > 0) return "#94a3b8";
  return "transparent";
}

const DISPLAY_STATUS_PRIORITY: Record<ProjectDisplayStatus, number> = {
  overdue: 0,
  today: 1,
  tomorrow: 2,
  soon: 3,
  urgent: 4,
  new: 5,
  in_progress: 6,
  delivered: 7,
  archived: 8,
};

export function getProjectDisplayStatusPriority(project: Project): number {
  return DISPLAY_STATUS_PRIORITY[getProjectDisplayStatus(project)];
}

export function compareProjectsByUrgency(a: Project, b: Project): number {
  const priorityDiff = getProjectDisplayStatusPriority(a) - getProjectDisplayStatusPriority(b);
  if (priorityDiff !== 0) return priorityDiff;

  const aDeadline = getProjectEffectiveDeadlineDate(a);
  const bDeadline = getProjectEffectiveDeadlineDate(b);
  const aTs = aDeadline ? new Date(aDeadline).getTime() : Number.MAX_SAFE_INTEGER;
  const bTs = bDeadline ? new Date(bDeadline).getTime() : Number.MAX_SAFE_INTEGER;
  if (aTs !== bTs) return aTs - bTs;

  if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
  return 0;
}

export function getNextTaskForProject(projectId: string, tasks: Task[]): Task | null {
  const open = tasks.filter((t) => t.projectId === projectId && t.status !== "DONE");
  if (open.length === 0) return null;
  const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return [...open].sort(
    (a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
  )[0];
}

export function filterProjects(projects: Project[], filter: ProjectFilter): Project[] {
  if (filter === "all") return projects;
  if (filter === "urgent") {
    return projects.filter((p) => isProjectUrgent(p));
  }
  if (filter === "overdue") {
    return projects.filter((p) => isProjectOverdue(p));
  }
  if (filter === "recent") {
    return [...projects]
      .filter((p) => isProjectRecent(p))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  return projects;
}
