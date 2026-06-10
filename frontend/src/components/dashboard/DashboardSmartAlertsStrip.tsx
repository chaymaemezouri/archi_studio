"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { DashboardStats, SmartAlert } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { dashboardTaskRow } from "./dashboard-ui";

const SEVERITY_DOT: Record<SmartAlert["severity"], string> = {
  overdue: "bg-rose-500/90",
  today: "bg-amber-500/85",
  tomorrow: "bg-studio-light/45",
  soon: "bg-glass-muted/80",
};

const SEVERITY_LABEL: Record<SmartAlert["severity"], string> = {
  overdue: "En retard",
  today: "Aujourd'hui",
  tomorrow: "Demain",
  soon: "À venir",
};

function alertHref(alert: SmartAlert): string {
  if (alert.kind === "task") {
    return alert.projectId ? `/projects/${alert.projectId}?tab=tasks` : "/tasks";
  }
  if (alert.kind === "deadline") {
    return alert.projectId ? `/projects/${alert.projectId}` : "/calendar";
  }
  return alert.projectId ? `/projects/${alert.projectId}` : "/calendar";
}

function NextDeadlineRow({ stats }: { stats: DashboardStats }) {
  if (!stats.nextDeadlineDate || !stats.nextDeadlineTitle) return null;

  return (
    <li>
      <Link href="/calendar" className={cn(dashboardTaskRow, "items-center gap-2 px-3 py-1.5")}>
        <span className="h-1 w-1 shrink-0 rounded-full bg-studio-light/55" aria-hidden />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[12px] font-medium text-app-primary">
            {stats.nextDeadlineTitle}
          </span>
          <span className="mt-px flex flex-wrap items-center gap-x-1 text-[10px] text-glass-muted">
            {stats.nextDeadlineProject && (
              <span className="truncate">{stats.nextDeadlineProject}</span>
            )}
            {stats.nextDeadlineProject && <span aria-hidden>·</span>}
            <span className="shrink-0">
              {formatDate(stats.nextDeadlineDate, "EEE d MMM")}
            </span>
          </span>
        </span>
        <ChevronRight
          className="h-3 w-3 shrink-0 text-glass-muted/40 transition group-hover:text-glass-secondary"
          strokeWidth={1.75}
        />
      </Link>
    </li>
  );
}

interface DashboardSmartAlertsStripProps {
  alerts: SmartAlert[];
  maxItems?: number;
  stats?: DashboardStats;
}

export default function DashboardSmartAlertsStrip({
  alerts,
  maxItems = 4,
  stats,
}: DashboardSmartAlertsStripProps) {
  const items = alerts.slice(0, maxItems);
  const overflow = alerts.length - items.length;
  const hasDeadline = Boolean(stats?.nextDeadlineDate && stats?.nextDeadlineTitle);

  if (items.length === 0 && !hasDeadline) return null;

  return (
    <ul className="divide-y divide-app">
      {hasDeadline && stats && <NextDeadlineRow stats={stats} />}
      {items.map((alert) => (
        <li key={alert.id}>
          <Link href={alertHref(alert)} className={cn(dashboardTaskRow, "items-center gap-2 px-3 py-1.5")}>
            <span
              className={cn("h-1 w-1 shrink-0 rounded-full", SEVERITY_DOT[alert.severity])}
              aria-hidden
            />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[12px] font-medium text-app-primary">
                {alert.title}
              </span>
              <span className="mt-px flex flex-wrap items-center gap-x-1 text-[10px] text-glass-muted">
                {alert.projectName && <span className="truncate">{alert.projectName}</span>}
                {alert.projectName && <span aria-hidden>·</span>}
                <span className="shrink-0">{SEVERITY_LABEL[alert.severity]}</span>
              </span>
            </span>
            <ChevronRight
              className="h-3 w-3 shrink-0 text-glass-muted/40 transition group-hover:text-glass-secondary"
              strokeWidth={1.75}
            />
          </Link>
        </li>
      ))}
      {overflow > 0 && (
        <li>
          <Link
            href="/notifications"
            className="flex items-center justify-between px-3 py-1.5 text-[10px] text-glass-muted transition hover:text-studio-light"
          >
            <span>
              +{overflow} autre{overflow > 1 ? "s" : ""} alerte{overflow > 1 ? "s" : ""}
            </span>
            <ChevronRight className="h-3 w-3" strokeWidth={1.75} />
          </Link>
        </li>
      )}
    </ul>
  );
}
