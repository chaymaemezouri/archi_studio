import {
  addDays,
  endOfWeek,
  isSameDay,
  startOfDay,
} from "date-fns";
import type { Deadline, Priority } from "@/types";

export type DeadlineFilter =
  | "all"
  | "upcoming"
  | "today"
  | "week"
  | "overdue"
  | "done";

export type DeadlineSort = "date" | "recent" | "priority";

export interface DeadlineProjectGroup {
  key: string;
  projectId: string | null;
  projectName: string;
  deadlines: Deadline[];
}

const PRIORITY_ORDER: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function isDeadlineOverdue(deadline: Deadline): boolean {
  if (deadline.done) return false;
  return startOfDay(new Date(deadline.date)) < startOfDay(new Date());
}

export function getDeadlineStatusLabel(deadline: Deadline): string {
  if (deadline.done) return "Terminé";
  if (isDeadlineOverdue(deadline)) return "En retard";
  const d = startOfDay(new Date(deadline.date));
  const today = startOfDay(new Date());
  if (isSameDay(d, today)) return "Aujourd'hui";
  if (isSameDay(d, addDays(today, 1))) return "Demain";
  return "À venir";
}

export function searchDeadlines(deadlines: Deadline[], query: string): Deadline[] {
  const q = query.trim().toLowerCase();
  if (!q) return deadlines;
  return deadlines.filter((d) => {
    const hay = [d.title, d.project?.name].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });
}

export function applyDeadlineFilter(
  deadlines: Deadline[],
  filter: DeadlineFilter
): Deadline[] {
  const today = startOfDay(new Date());
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  switch (filter) {
    case "done":
      return deadlines.filter((d) => d.done);
    case "overdue":
      return deadlines.filter((d) => isDeadlineOverdue(d));
    case "today":
      return deadlines.filter(
        (d) =>
          !d.done && isSameDay(startOfDay(new Date(d.date)), today)
      );
    case "week":
      return deadlines.filter((d) => {
        if (d.done) return false;
        const day = startOfDay(new Date(d.date));
        return day >= today && day <= weekEnd;
      });
    case "upcoming":
      return deadlines.filter((d) => !d.done);
    case "all":
    default:
      return deadlines;
  }
}

export function sortDeadlines(
  deadlines: Deadline[],
  sort: DeadlineSort
): Deadline[] {
  const list = [...deadlines];
  switch (sort) {
    case "recent":
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "priority":
      return list.sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
      );
    case "date":
    default:
      return list.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }
}

export function filterAndSortDeadlines(
  deadlines: Deadline[],
  options: {
    query: string;
    filter: DeadlineFilter;
    sort: DeadlineSort;
    hideDone: boolean;
  }
): Deadline[] {
  let list = searchDeadlines(deadlines, options.query);
  if (options.filter !== "all") {
    list = applyDeadlineFilter(list, options.filter);
  } else if (options.hideDone) {
    list = list.filter((d) => !d.done);
  }
  return sortDeadlines(list, options.sort);
}

function deadlineGroupKey(d: Deadline): string {
  if (d.projectId) return `project:${d.projectId}`;
  if (d.project?.id) return `project:${d.project.id}`;
  return "unclassified";
}

function deadlineGroupTitle(d: Deadline): string {
  return d.project?.name ?? "Sans projet";
}

export function groupDeadlinesByProject(
  items: Deadline[],
  sort: DeadlineSort = "date"
): DeadlineProjectGroup[] {
  const map = new Map<string, DeadlineProjectGroup>();

  for (const deadline of items) {
    const key = deadlineGroupKey(deadline);
    if (!map.has(key)) {
      map.set(key, {
        key,
        projectId: deadline.projectId ?? deadline.project?.id ?? null,
        projectName: deadlineGroupTitle(deadline),
        deadlines: [],
      });
    }
    map.get(key)!.deadlines.push(deadline);
  }

  const groups = Array.from(map.values());
  for (const group of groups) {
    group.deadlines = sortDeadlines(group.deadlines, sort);
  }

  return groups.sort((a, b) => {
    const aUnclassified = a.key === "unclassified";
    const bUnclassified = b.key === "unclassified";
    if (aUnclassified && !bUnclassified) return 1;
    if (!aUnclassified && bUnclassified) return -1;
    return a.projectName.localeCompare(b.projectName, "fr");
  });
}
