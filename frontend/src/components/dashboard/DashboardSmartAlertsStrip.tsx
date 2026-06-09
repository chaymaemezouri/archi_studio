"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { SmartAlert } from "@/types";
import { accentBar } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import { dashboardPanel, dashboardPanelTitle } from "./dashboard-ui";

const SEVERITY_DOT: Record<SmartAlert["severity"], string> = {
  overdue: "bg-rose-400",
  today: "bg-amber-400",
  tomorrow: "bg-studio-light",
  soon: "bg-white/35",
};

interface DashboardSmartAlertsStripProps {
  alerts: SmartAlert[];
}

export default function DashboardSmartAlertsStrip({ alerts }: DashboardSmartAlertsStripProps) {
  const items = alerts.slice(0, 5);
  if (items.length === 0) return null;

  return (
    <section className={cn(dashboardPanel, "border-amber-500/10")}>
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-3.5 py-2">
        <h3 className={dashboardPanelTitle}>
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400/90" strokeWidth={1.75} />
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          À traiter en priorité
        </h3>
        <span className="text-[10px] text-white/35">{items.length} alerte{items.length > 1 ? "s" : ""}</span>
      </div>
      <ul className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:flex-wrap">
        {items.map((alert) => {
          const href = alert.projectId
            ? `/projects/${alert.projectId}`
            : "/calendar";
          return (
            <li key={alert.id} className="min-w-0 sm:max-w-[220px]">
              <Link
                href={href}
                className="flex w-full items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 transition hover:border-studio-light/20 hover:bg-white/[0.05] sm:inline-flex sm:max-w-[220px] sm:px-2.5 sm:py-1.5"
              >
                <span
                  className={cn("h-1.5 w-1.5 shrink-0 rounded-full", SEVERITY_DOT[alert.severity])}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-[12px] text-white/80 sm:text-[11px]">
                  {alert.title}
                </span>
                {alert.projectName && (
                  <span className="shrink-0 text-[10px] text-white/35">
                    {alert.projectName}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
