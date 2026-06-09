"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { accentBar } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import { dashboardPanel, dashboardPanelHeader, dashboardPanelTitle } from "./dashboard-ui";

interface DashboardChartCardProps {
  title: string;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
  className?: string;
  height?: number;
}

export default function DashboardChartCard({
  title,
  href,
  linkLabel = "Détails",
  children,
  className,
  height = 168,
}: DashboardChartCardProps) {
  return (
    <section className={cn(dashboardPanel, className)}>
      <div className={dashboardPanelHeader}>
        <h3 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          {title}
        </h3>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-glass-muted transition hover:text-studio-light"
          >
            {linkLabel}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="px-2 pb-2 pt-1" style={{ height }}>
        {children}
      </div>
    </section>
  );
}
