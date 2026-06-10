"use client";

import Link from "next/link";
import { AlertTriangle, Bell, CalendarClock } from "lucide-react";
import DashboardSmartAlertsStrip from "./DashboardSmartAlertsStrip";
import type { DashboardStats, Notification, SmartAlert } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";
import {
  dashboardLink,
  dashboardPanel,
  dashboardPanelTitle,
} from "./dashboard-ui";

interface DashboardPrioritySectionProps {
  alerts: SmartAlert[];
  notifications: Notification[];
  stats: DashboardStats;
  className?: string;
}

export default function DashboardPrioritySection({
  alerts,
  notifications,
  stats,
  className,
}: DashboardPrioritySectionProps) {
  const unreadNotifs = notifications.filter((n) => !n.read).slice(0, 4);
  const hasNextDeadline = Boolean(stats.nextDeadlineDate && stats.nextDeadlineTitle);
  const hasContent = alerts.length > 0 || unreadNotifs.length > 0 || hasNextDeadline;

  if (!hasContent) return null;

  return (
    <div className={cn("space-y-2.5", className)}>
      {alerts.length > 0 && <DashboardSmartAlertsStrip alerts={alerts} />}

      {(unreadNotifs.length > 0 || hasNextDeadline) && (
        <div className="grid gap-2.5 md:grid-cols-2">
          {hasNextDeadline && (
            <section className={dashboardPanel}>
              <div className="flex items-center gap-2 border-b border-app px-3.5 py-2">
                <CalendarClock
                  className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400"
                  strokeWidth={1.75}
                />
                <h3 className={dashboardPanelTitle}>
                  <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
                  Prochaine échéance
                </h3>
              </div>
              <div className="px-3.5 py-3">
                <p className="text-[14px] font-semibold text-app-primary">
                  {stats.nextDeadlineTitle}
                </p>
                <p className="mt-1 text-[12px] text-glass-muted">
                  {formatDate(stats.nextDeadlineDate!, "EEEE d MMMM")}
                  {stats.nextDeadlineProject && ` · ${stats.nextDeadlineProject}`}
                </p>
                <Link
                  href="/calendar"
                  className={cn(dashboardLink, "mt-2 inline-block text-[11px]")}
                >
                  Voir le calendrier →
                </Link>
              </div>
            </section>
          )}

          {unreadNotifs.length > 0 && (
            <section className={dashboardPanel}>
              <div className="flex items-center justify-between gap-2 border-b border-app px-3.5 py-2">
                <h3 className={dashboardPanelTitle}>
                  <Bell className="h-3.5 w-3.5 text-studio-light/80" strokeWidth={1.75} />
                  <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
                  Notifications
                </h3>
                <Link
                  href="/notifications"
                  className={cn(dashboardLink, "text-[10px]")}
                >
                  Tout voir
                </Link>
              </div>
              <ul className="divide-y divide-app">
                {unreadNotifs.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.link ?? "/notifications"}
                      className="flex items-start gap-2 px-3.5 py-2.5 transition hover:bg-studio-muted/30"
                    >
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400/90" />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-glass">
                          {n.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-glass-muted">
                          {n.message}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
