import { addDays, startOfDay } from "date-fns";
import type { DashboardOverview, DashboardStats, Deadline, Meeting, Project, Task } from "@/types";
import { isSameLocalDay, isUrgentDeadline } from "@/lib/dates";

export function getProjectNextDeadline(project: Project): Deadline | null {
  const open = (project.deadlines ?? []).filter((d) => !d.done);
  if (open.length === 0) return null;
  return [...open].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

export function isProjectUrgent(project: Project): boolean {
  const dl = getProjectNextDeadline(project);
  if (dl) return isUrgentDeadline(dl.date, dl.done);
  if (project.deadline) return isUrgentDeadline(project.deadline);
  return false;
}

/** Max 3 : urgent → deadline proche → récemment modifié */
export function pickPriorityProjects(projects: Project[]): Project[] {
  if (projects.length === 0) return [];

  const ranked = [...projects].sort((a, b) => {
    const aUrgent = isProjectUrgent(a) ? 1 : 0;
    const bUrgent = isProjectUrgent(b) ? 1 : 0;
    if (aUrgent !== bUrgent) return bUrgent - aUrgent;

    const aDl = getProjectNextDeadline(a)?.date ?? a.deadline ?? "9999";
    const bDl = getProjectNextDeadline(b)?.date ?? b.deadline ?? "9999";
    const dlDiff = new Date(aDl).getTime() - new Date(bDl).getTime();
    if (dlDiff !== 0) return dlDiff;

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return ranked.slice(0, 3);
}

export function getTodayMeetings(meetings: Meeting[]): Meeting[] {
  const today = new Date();
  return meetings.filter((m) => isSameLocalDay(m.date, today));
}

export function getNextUrgentDeadline(deadlines: Deadline[]): Deadline | null {
  const open = deadlines.filter((d) => !d.done && isUrgentDeadline(d.date, d.done));
  if (open.length === 0) return null;
  return [...open].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

export function hasFinanceContent(
  stats?: DashboardStats,
  payments?: DashboardOverview["recentPayments"]
): boolean {
  if (!stats) return false;
  const hasPayments = (payments?.length ?? 0) > 0;
  return (
    stats.pendingDevis > 0 ||
    stats.pendingInvoices > 0 ||
    stats.unpaidInvoicesAmount > 0 ||
    stats.overdueInvoicesCount > 0 ||
    hasPayments
  );
}

export function countOpenTodayTasks(tasks: Task[]): number {
  return tasks.filter((t) => t.status !== "DONE").length;
}

export type AgendaEvent = {
  id: string;
  kind: "meeting" | "deadline" | "task";
  title: string;
  time?: string | null;
  projectName?: string;
  urgent?: boolean;
};

export function getAgendaDays(): Date[] {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, i) => addDays(today, i));
}

export function buildAgendaEventsForDay(
  day: Date,
  meetings: Meeting[],
  deadlines: Deadline[],
  tasks: Task[],
  options?: {
    skipUrgentDeadlines?: boolean;
    skipTodayMeetings?: boolean;
    skipTodayTasks?: boolean;
  }
): AgendaEvent[] {
  const items: AgendaEvent[] = [];
  const isToday = isSameLocalDay(day, new Date());

  for (const m of meetings) {
    if (!isSameLocalDay(m.date, day)) continue;
    if (isToday && options?.skipTodayMeetings) continue;
    items.push({
      id: `m-${m.id}`,
      kind: "meeting",
      title: m.title,
      time: m.startTime,
      projectName: m.project?.name,
    });
  }

  for (const d of deadlines) {
    if (!isSameLocalDay(d.date, day) || d.done) continue;
    const urgent = isUrgentDeadline(d.date, d.done);
    if (options?.skipUrgentDeadlines && urgent) continue;
    items.push({
      id: `d-${d.id}`,
      kind: "deadline",
      title: d.title,
      projectName: d.project?.name,
      urgent,
    });
  }

  for (const t of tasks) {
    if (t.status === "DONE") continue;
    const td = t.dueDate ?? t.scheduledAt;
    if (!td || !isSameLocalDay(td, day)) continue;
    if (isToday && options?.skipTodayTasks) continue;
    items.push({
      id: `t-${t.id}`,
      kind: "task",
      title: t.title,
      projectName: t.project?.name,
    });
  }

  return items.sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    return 0;
  });
}
