import { isOverdueDeadline, isUrgentDeadline } from "@/lib/dates";
import type {
  DashboardOverview,
  DashboardStats,
  Deadline,
  Meeting,
  Project,
  SmartAlert,
  Task,
} from "@/types";
import {
  getProjectNextDeadline,
  getProjectStatusBadge,
  isProjectOverdue,
} from "@/lib/project-status";

/** Projets prioritaires : retard → urgent → deadline proche → récent (max 4). */
export function pickPriorityProjects(projects: Project[], limit = 4) {
  const score = (p: Project): number => {
    if (isProjectOverdue(p)) return 0;
    const badge = getProjectStatusBadge(p);
    if (badge === "urgent") return 1;
    return 2;
  };

  return [...projects]
    .sort((a, b) => {
      const diff = score(a) - score(b);
      if (diff !== 0) return diff;

      const aDl = getProjectNextDeadline(a)?.date ?? a.deadline ?? "9999-12-31";
      const bDl = getProjectNextDeadline(b)?.date ?? b.deadline ?? "9999-12-31";
      const dlCmp = new Date(aDl).getTime() - new Date(bDl).getTime();
      if (dlCmp !== 0) return dlCmp;

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, limit);
}

function pickImportantTodayTask(tasks: Task[]): Task | null {
  const open = tasks.filter((t) => t.status !== "DONE");
  if (open.length === 0) return null;
  const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return [...open].sort(
    (a, b) => (order[a.priority] ?? 2) - (order[b.priority] ?? 2)
  )[0];
}

function pickUrgentDeadline(deadlines: Deadline[]): Deadline | null {
  const open = deadlines.filter((d) => !d.done);
  const urgent = open.filter(
    (d) => isOverdueDeadline(d.date, d.done) || isUrgentDeadline(d.date, d.done)
  );
  const pool = urgent.length > 0 ? urgent : open;
  if (pool.length === 0) return null;
  return [...pool].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];
}

function pickRecommendedAction(
  alerts: SmartAlert[],
  meetings: Meeting[],
  stats?: DashboardStats
): { label: string; detail?: string; href?: string } | null {
  const top = alerts[0];
  if (top) {
    return {
      label: top.title,
      detail: top.projectName ?? top.subtitle,
      href: top.projectId ? `/projects/${top.projectId}` : undefined,
    };
  }

  const todayMeetings = meetings.filter(
    (m) => new Date(m.date).toDateString() === new Date().toDateString()
  );
  if (todayMeetings.length > 0) {
    const m = todayMeetings[0];
    return {
      label: `Réunion : ${m.title}`,
      detail: m.startTime ?? undefined,
    };
  }

  if (stats && stats.overdueInvoicesCount > 0) {
    return {
      label: "Factures en retard à traiter",
      detail: `${stats.overdueInvoicesCount} facture(s)`,
      href: "/finances/quotes-invoices?tab=invoices",
    };
  }

  if (stats?.nextDeadlineTitle) {
    return {
      label: stats.nextDeadlineTitle,
      detail: stats.nextDeadlineProject ?? undefined,
    };
  }

  return null;
}

export type TodayExecutiveBrief = {
  urgentDeadline: Deadline | null;
  importantTask: Task | null;
  recommendedAction: { label: string; detail?: string; href?: string } | null;
  summaryLine: string;
  isCalm: boolean;
};

export function buildTodayExecutiveBrief(data: {
  stats?: DashboardStats;
  todayTasks?: Task[];
  upcomingDeadlines?: Deadline[];
  meetings?: Meeting[];
  smartAlerts?: SmartAlert[];
}): TodayExecutiveBrief {
  const stats = data.stats;
  const urgentDeadline = pickUrgentDeadline(data.upcomingDeadlines ?? []);
  const importantTask = pickImportantTodayTask(data.todayTasks ?? []);
  const recommendedAction = pickRecommendedAction(
    data.smartAlerts ?? [],
    data.meetings ?? [],
    stats
  );

  const active = stats?.activeProjects ?? 0;
  const weekDl = stats?.upcomingDeadlines ?? 0;
  const summaryLine = `Vous avez ${active} projet${active !== 1 ? "s" : ""} actif${active !== 1 ? "s" : ""}, ${weekDl} deadline${weekDl !== 1 ? "s" : ""} cette semaine.`;

  const isCalm = !urgentDeadline && !importantTask && !recommendedAction;

  return {
    urgentDeadline,
    importantTask,
    recommendedAction,
    summaryLine,
    isCalm,
  };
}

export function buildBriefFromOverview(overview: DashboardOverview): TodayExecutiveBrief {
  return buildTodayExecutiveBrief({
    stats: overview.stats,
    todayTasks: overview.todayTasks,
    upcomingDeadlines: overview.upcomingDeadlines,
    meetings: overview.meetings,
    smartAlerts: overview.smartAlerts,
  });
}
