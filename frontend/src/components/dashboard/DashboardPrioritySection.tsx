"use client";

import DashboardSmartAlertsStrip from "./DashboardSmartAlertsStrip";
import type { DashboardStats, SmartAlert } from "@/types";
import { cn } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";
import {
  dashboardListHeaderBorder,
  dashboardPanel,
  dashboardPanelTitle,
} from "./dashboard-ui";

interface DashboardPrioritySectionProps {
  alerts: SmartAlert[];
  stats: DashboardStats;
  className?: string;
}

export default function DashboardPrioritySection({
  alerts,
  stats,
  className,
}: DashboardPrioritySectionProps) {
  const hasAlerts = alerts.length > 0;
  const hasNextDeadline = Boolean(stats.nextDeadlineDate && stats.nextDeadlineTitle);

  if (!hasAlerts && !hasNextDeadline) return null;

  return (
    <section className={cn(dashboardPanel, "overflow-hidden", className)}>
      <div className={cn("flex items-center justify-between gap-3 px-3 py-2", dashboardListHeaderBorder)}>
        <h3 className={dashboardPanelTitle}>
          <span className={accentBar} aria-hidden />
          Priorités
        </h3>
        {hasAlerts && (
          <span className="tabular-nums text-[11px] text-glass-muted">{alerts.length}</span>
        )}
      </div>
      <DashboardSmartAlertsStrip
        alerts={alerts}
        stats={hasNextDeadline ? stats : undefined}
      />
    </section>
  );
}
