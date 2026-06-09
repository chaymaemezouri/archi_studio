import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { Task, TaskStatus } from "@/types";

export type TaskMainFilter =
  | "all"
  | "today"
  | "tomorrow"
  | "week"
  | "overdue"
  | "urgent"
  | "done";

export type TaskSort =
  | "deadline"
  | "recent"
  | "oldest"
  | "priority"
  | "status";

export function isTaskClosed(status: TaskStatus): boolean {
  return status === "DONE" || status === "CANCELLED";
}

export function getTaskDeadlineDate(task: Task): string | null {
  return task.dueDate ?? null;
}

export type TaskDeadlineBadge =
  | "none"
  | "today"
  | "tomorrow"
  | "soon"
  | "overdue";

export const TASK_DEADLINE_BADGE_LABELS: Record<TaskDeadlineBadge, string> = {
  none: "Aucune deadline",
  today: "Aujourd'hui",
  tomorrow: "Demain",
  soon: "Bientôt",
  overdue: "En retard",
};

export function getTaskDeadlineBadge(task: Task): TaskDeadlineBadge {
  const date = getTaskDeadlineDate(task);
  if (!date) return "none";
  if (isTaskClosed(task.status)) return "none";

  const d = startOfDay(new Date(date));
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  if (d < today) return "overdue";
  if (isSameDay(d, today)) return "today";
  if (isSameDay(d, tomorrow)) return "tomorrow";

  const days = differenceInCalendarDays(d, today);
  if (days > 0 && days <= 7) return "soon";

  return "none";
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;

  return tasks.filter((t) => {
    const hay = [
      t.title,
      t.description,
      t.notes,
      t.projectName,
      t.project?.name,
      t.clientName,
      t.project?.client?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function applyTaskMainFilter(tasks: Task[], filter: TaskMainFilter): Task[] {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  switch (filter) {
    case "today":
      return tasks.filter((t) => {
        const d = getTaskDeadlineDate(t);
        return d && isSameDay(new Date(d), today) && !isTaskClosed(t.status);
      });
    case "tomorrow":
      return tasks.filter((t) => {
        const d = getTaskDeadlineDate(t);
        return d && isSameDay(new Date(d), tomorrow) && !isTaskClosed(t.status);
      });
    case "week":
      return tasks.filter((t) => {
        const d = getTaskDeadlineDate(t);
        if (!d || isTaskClosed(t.status)) return false;
        const day = startOfDay(new Date(d));
        return day >= today && day <= weekEnd;
      });
    case "overdue":
      return tasks.filter((t) => {
        const d = getTaskDeadlineDate(t);
        return d && startOfDay(new Date(d)) < today && !isTaskClosed(t.status);
      });
    case "urgent":
      return tasks.filter(
        (t) =>
          !isTaskClosed(t.status) &&
          (t.priority === "URGENT" || t.priority === "HIGH")
      );
    case "done":
      return tasks.filter((t) => t.status === "DONE");
    case "all":
    default:
      return tasks;
  }
}

export function applyTaskStatusFilter(
  tasks: Task[],
  status: TaskStatus | "all"
): Task[] {
  if (status === "all") return tasks;
  return tasks.filter((t) => t.status === status);
}

export function applyTaskPriorityFilter(
  tasks: Task[],
  priority: string | "all"
): Task[] {
  if (priority === "all") return tasks;
  return tasks.filter((t) => t.priority === priority);
}

export function applyTaskProjectFilter(
  tasks: Task[],
  projectId: string | "all" | "personal"
): Task[] {
  if (projectId === "all") return tasks;
  if (projectId === "personal") return tasks.filter((t) => !t.projectId);
  return tasks.filter((t) => t.projectId === projectId);
}

export function applyTaskClientFilter(
  tasks: Task[],
  clientId: string | "all"
): Task[] {
  if (clientId === "all") return tasks;
  return tasks.filter((t) => t.clientId === clientId);
}

const PRIORITY_ORDER = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const STATUS_ORDER = { TODO: 0, IN_PROGRESS: 1, DONE: 2, CANCELLED: 3 };

export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const list = [...tasks];

  switch (sort) {
    case "oldest":
      return list.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "priority":
      return list.sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
      );
    case "status":
      return list.sort(
        (a, b) =>
          (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
      );
    case "recent":
      return list.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    case "deadline":
    default:
      return list.sort((a, b) => {
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (ad !== bd) return ad - bd;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }
}

export function filterAndSortTasks(
  tasks: Task[],
  options: {
    query: string;
    mainFilter: TaskMainFilter;
    statusFilter: TaskStatus | "all";
    priorityFilter: string | "all";
    projectFilter: string | "all" | "personal";
    clientFilter: string | "all";
    sort: TaskSort;
    showDone: boolean;
  }
): Task[] {
  let list = searchTasks(tasks, options.query);

  if (options.mainFilter !== "all") {
    list = applyTaskMainFilter(list, options.mainFilter);
  } else if (!options.showDone) {
    list = list.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED");
  }

  list = applyTaskStatusFilter(list, options.statusFilter);
  list = applyTaskPriorityFilter(list, options.priorityFilter);
  list = applyTaskProjectFilter(list, options.projectFilter);
  list = applyTaskClientFilter(list, options.clientFilter);

  return sortTasks(list, options.sort);
}

export { startOfWeek, endOfWeek, startOfDay, addDays, isSameDay };
