import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import type { DashboardOverview, Task } from "@/types";

export function buildAgendaWeek(data: DashboardOverview) {
  const today = startOfDay(new Date());
  const tasks = [
    ...data.todayTasks,
    ...data.tomorrowTasks,
    ...data.calendarTasks,
  ];
  const deadlines = data.upcomingDeadlines ?? [];
  const meetings = data.meetings ?? [];

  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i);
    return {
      label: format(day, "EEE", { locale: fr }),
      tasks: countTasksOnDay(tasks, day),
      deadlines: deadlines.filter(
        (d) => !d.done && isSameDay(new Date(d.date), day)
      ).length,
      meetings: meetings.filter((m) =>
        isSameDay(new Date(m.date), day)
      ).length,
    };
  });
}

function countTasksOnDay(tasks: Task[], day: Date) {
  const seen = new Set<string>();
  let n = 0;
  for (const t of tasks) {
    if (seen.has(t.id) || t.status === "DONE") continue;
    const d = t.scheduledAt ?? t.dueDate;
    if (!d) continue;
    if (isSameDay(new Date(d), day)) {
      seen.add(t.id);
      n++;
    }
  }
  return n;
}

export function buildTaskCounts(data: DashboardOverview) {
  const seen = new Set<string>();
  let todo = 0;
  let inProgress = 0;
  for (const t of [
    ...data.todayTasks,
    ...data.tomorrowTasks,
    ...data.calendarTasks,
  ]) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    if (t.status === "TODO") todo++;
    if (t.status === "IN_PROGRESS") inProgress++;
  }
  return { todo, inProgress };
}

export function revenueMonthTrend(series: { value: number }[]): number | null {
  if (series.length < 2) return null;
  const curr = series[series.length - 1]?.value ?? 0;
  const prev = series[series.length - 2]?.value ?? 0;
  if (prev === 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - prev) / prev) * 100);
}

export function activityWeekTotal(series: { value: number }[]) {
  return series.reduce((s, p) => s + p.value, 0);
}

export function fallbackActivityFromLogs(
  logs: DashboardOverview["recentActivity"]
) {
  const start = startOfDay(addDays(new Date(), -13));
  return Array.from({ length: 14 }, (_, i) => {
    const day = addDays(start, i);
    const value = logs.filter((l) =>
      isSameDay(new Date(l.createdAt), day)
    ).length;
    return {
      label: format(day, "EEE", { locale: fr }),
      value,
    };
  });
}

export function fallbackRevenueFromPayments(
  payments: DashboardOverview["recentPayments"]
) {
  const now = new Date();
  const start = startOfDay(
    new Date(now.getFullYear(), now.getMonth() - 5, 1)
  );
  return Array.from({ length: 6 }, (_, i) => {
    const month = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const value = payments
      .filter((p) => {
        const d = new Date(p.date);
        return (
          d.getMonth() === month.getMonth() &&
          d.getFullYear() === month.getFullYear()
        );
      })
      .reduce((s, p) => s + p.amount, 0);
    return {
      label: format(month, "MMM", { locale: fr }),
      value: Math.round(value),
    };
  });
}
