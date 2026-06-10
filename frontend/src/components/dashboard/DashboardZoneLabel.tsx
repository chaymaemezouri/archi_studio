"use client";

import { accentBar } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import { dashboardSectionLabel } from "./dashboard-ui";

interface DashboardZoneLabelProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

/** Libellé discret pour regrouper visuellement des blocs du dashboard */
export default function DashboardZoneLabel({
  id,
  children,
  className,
}: DashboardZoneLabelProps) {
  return (
    <div className={cn("flex items-center gap-2 px-0.5", className)}>
      <span className={cn(accentBar, "h-3 opacity-60")} aria-hidden />
      <h2 id={id} className={dashboardSectionLabel}>
        {children}
      </h2>
    </div>
  );
}
