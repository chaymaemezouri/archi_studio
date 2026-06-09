import { isTomorrow } from "date-fns";
import {
  isDeadlineToday,
  isOverdueDeadline,
} from "@/lib/dates";
import {
  compareProjectsByUrgency,
  getProjectDisplayStatus,
  getProjectDisplayStatusPriority,
  getProjectEffectiveDeadlineDate,
  isProjectDelivered,
  isProjectOverdue,
  PROJECT_DISPLAY_STATUS_LABELS,
} from "@/lib/project-status";
import type { DashboardOverview, Deadline, Project, Task } from "@/types";
import { PRIORITY_LABELS } from "@/types";
import { formatDate } from "@/lib/utils";

const PRIORITY_PROJECT_STATUSES = new Set([
  "overdue",
  "today",
  "tomorrow",
  "soon",
  "urgent",
  "in_progress",
]);

/** Projets prioritaires dashboard — retard, urgent, en cours (max 6). */
export function buildDashboardPriorityProjects(
  projects: Project[] | undefined,
  limit = 6
): Project[] {
  return (projects ?? [])
    .filter((p) => !isProjectDelivered(p))
    .filter((p) => PRIORITY_PROJECT_STATUSES.has(getProjectDisplayStatus(p)))
    .sort(compareProjectsByUrgency)
    .slice(0, limit);
}

export type UrgencyItemType = "project" | "task" | "deadline" | "finance";

export type UrgencyStatusTone = "red" | "orange" | "amber" | "blue" | "neutral";

export interface DashboardUrgencyItem {
  id: string;
  type: UrgencyItemType;
  typeLabel: string;
  title: string;
  subtitle?: string;
  statusLabel: string;
  statusTone: UrgencyStatusTone;
  dateLabel?: string;
  href: string;
  priority: number;
}

const TYPE_LABELS: Record<UrgencyItemType, string> = {
  project: "Projet",
  task: "Tâche",
  deadline: "Deadline",
  finance: "Finance",
};

function deadlineStatus(date: string, done?: boolean): {
  label: string;
  tone: UrgencyStatusTone;
  priority: number;
} {
  if (isOverdueDeadline(date, done)) {
    return { label: "En retard", tone: "red", priority: 0 };
  }
  if (isDeadlineToday(date, done)) {
    return { label: "Aujourd'hui", tone: "orange", priority: 1 };
  }
  if (isTomorrow(new Date(date))) {
    return { label: "Demain", tone: "amber", priority: 2 };
  }
  return { label: "Proche", tone: "blue", priority: 4 };
}

function projectTone(status: ReturnType<typeof getProjectDisplayStatus>): UrgencyStatusTone {
  if (status === "overdue") return "red";
  if (status === "today" || status === "urgent") return "orange";
  if (status === "tomorrow" || status === "soon") return "amber";
  return "blue";
}

function isUrgentProject(project: Project): boolean {
  if (isProjectDelivered(project)) return false;
  const status = getProjectDisplayStatus(project);
  return (
    isProjectOverdue(project) ||
    status === "today" ||
    status === "tomorrow" ||
    status === "urgent"
  );
}

function isUrgentTask(task: Task): boolean {
  return task.status !== "DONE" && (task.priority === "URGENT" || task.priority === "HIGH");
}

function isUrgentDeadline(deadline: Deadline): boolean {
  if (deadline.done) return false;
  return (
    isOverdueDeadline(deadline.date, deadline.done) ||
    isDeadlineToday(deadline.date, deadline.done) ||
    isTomorrow(new Date(deadline.date))
  );
}

export function buildDashboardUrgencies(
  data: DashboardOverview,
  limit = 5
): DashboardUrgencyItem[] {
  const items: DashboardUrgencyItem[] = [];
  const seen = new Set<string>();

  const push = (item: DashboardUrgencyItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  for (const project of data.projectsInProgress ?? []) {
    if (!isUrgentProject(project)) continue;
    const status = getProjectDisplayStatus(project);
    const deadline = getProjectEffectiveDeadlineDate(project);
    push({
      id: `project-${project.id}`,
      type: "project",
      typeLabel: TYPE_LABELS.project,
      title: project.name,
      subtitle: [project.client?.company || project.client?.name, project.city]
        .filter(Boolean)
        .slice(0, 1)
        .join(""),
      statusLabel: PROJECT_DISPLAY_STATUS_LABELS[status],
      statusTone: projectTone(status),
      dateLabel: deadline ? formatDate(deadline, "dd MMM") : undefined,
      href: `/projects/${project.id}`,
      priority: getProjectDisplayStatusPriority(project),
    });
  }

  const tasks = [
    ...(data.todayTasks ?? []),
    ...(data.tomorrowTasks ?? []),
  ].filter(isUrgentTask);

  for (const task of tasks) {
    const href = task.projectId ? `/projects/${task.projectId}?tab=tasks` : "/tasks";
    push({
      id: `task-${task.id}`,
      type: "task",
      typeLabel: TYPE_LABELS.task,
      title: task.title,
      subtitle: task.project?.name ?? task.projectName ?? undefined,
      statusLabel: PRIORITY_LABELS[task.priority],
      statusTone: task.priority === "URGENT" ? "red" : "orange",
      dateLabel: task.dueDate ? formatDate(task.dueDate, "dd MMM") : undefined,
      href,
      priority: task.priority === "URGENT" ? 0 : 1,
    });
  }

  for (const deadline of data.upcomingDeadlines ?? []) {
    if (!isUrgentDeadline(deadline)) continue;
    const { label, tone, priority } = deadlineStatus(deadline.date, deadline.done);
    const href = deadline.projectId
      ? `/projects/${deadline.projectId}?tab=deadlines`
      : "/calendar";
    push({
      id: `deadline-${deadline.id}`,
      type: "deadline",
      typeLabel: TYPE_LABELS.deadline,
      title: deadline.title,
      subtitle: deadline.project?.name,
      statusLabel: label,
      statusTone: tone,
      dateLabel: formatDate(deadline.date, "dd MMM"),
      href,
      priority,
    });
  }

  const overdueInvoices = data.stats?.overdueInvoicesCount ?? 0;
  if (overdueInvoices > 0) {
    push({
      id: "finance-overdue",
      type: "finance",
      typeLabel: TYPE_LABELS.finance,
      title: `${overdueInvoices} facture${overdueInvoices > 1 ? "s" : ""} en retard`,
      statusLabel: "En retard",
      statusTone: "red",
      href: "/finances/quotes-invoices",
      priority: 0,
    });
  }

  const pendingDevis = data.stats?.pendingDevis ?? 0;
  if (pendingDevis > 0 && items.length < limit) {
    push({
      id: "finance-devis",
      type: "finance",
      typeLabel: TYPE_LABELS.finance,
      title: `${pendingDevis} devis en attente`,
      statusLabel: "À suivre",
      statusTone: "amber",
      href: "/finances/quotes-invoices",
      priority: 3,
    });
  }

  return items
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit);
}
