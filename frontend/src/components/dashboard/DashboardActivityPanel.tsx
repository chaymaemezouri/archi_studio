"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ActivityLog } from "@/types";
import { accentBar } from "@/lib/glass-styles";
import { cn, formatActivityLabel, formatRelativeTime } from "@/lib/utils";
import { dashboardPanel, dashboardPanelHeader, dashboardPanelTitle } from "./dashboard-ui";

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
          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-white/40 transition hover:text-studio-light"
        >
          Journal
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-3.5 py-6 text-center text-[11px] text-white/35">Aucune activité récente</p>
      ) : (
        <ul className="divide-y divide-white/[0.05] px-1 py-1">
          {items.map((activity) => (
            <li key={activity.id}>
              <Link
                href={
                  activity.projectId
                    ? `/projects/${activity.projectId}`
                    : "/activity"
                }
                className="block rounded-md px-2.5 py-2 transition hover:bg-white/[0.04]"
              >
                <p className="line-clamp-2 text-[12px] leading-snug text-white/82">
                  {formatActivityLabel(activity)}
                </p>
                <p className="mt-0.5 text-[10px] text-white/35">
                  {activity.project?.name && (
                    <span className="text-white/45">{activity.project.name} · </span>
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
