"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ActivityLog } from "@/types";
import { accentBar } from "@/lib/glass-styles";
import { cn, formatActivityLabel, formatRelativeTime } from "@/lib/utils";
import { dashboardLink, dashboardPanel, dashboardPanelHeader, dashboardPanelTitle } from "./dashboard-ui";

interface DashboardActivityPanelProps {
  activities: ActivityLog[];
  className?: string;
}

export default function DashboardActivityPanel({
  activities,
  className,
}: DashboardActivityPanelProps) {
  const items = activities.slice(0, 6);

  return (
    <section className={cn(dashboardPanel, className)}>
      <div className={dashboardPanelHeader}>
        <h3 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Activité récente
        </h3>
        <Link
          href="/activity"
          className={cn(dashboardLink, "inline-flex items-center gap-0.5 text-[10px]")}
        >
          Journal
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-3.5 py-6 text-center text-[11px] text-glass-muted">Aucune activité récente</p>
      ) : (
        <ul className="divide-y divide-[color:var(--color-border)] px-1 py-1">
          {items.map((activity) => (
            <li key={activity.id}>
              <Link
                href={
                  activity.projectId
                    ? `/projects/${activity.projectId}`
                    : "/activity"
                }
                className="block rounded-md px-2.5 py-2 transition hover:bg-studio-muted/40"
              >
                <p className="line-clamp-2 text-[12px] leading-snug text-glass">
                  {formatActivityLabel(activity)}
                </p>
                <p className="mt-0.5 text-[10px] text-glass-muted">
                  {activity.project?.name && (
                    <span className="text-glass-muted">{activity.project.name} · </span>
                  )}
                  {formatRelativeTime(activity.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
