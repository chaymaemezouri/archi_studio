"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import DashboardProjectGlassCard from "@/components/projects/DashboardProjectGlassCard";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";
import {
  dashboardLink,
  dashboardMobileScrollItem,
  dashboardMobileScrollRow,
  dashboardPanel,
  dashboardPanelHeader,
  dashboardPanelTitle,
} from "./dashboard-ui";

interface DashboardActiveProjectsProps {
  projects: Project[];
  className?: string;
}

export default function DashboardActiveProjects({
  projects,
  className,
}: DashboardActiveProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section className={cn(dashboardPanel, className)}>
      <div className={dashboardPanelHeader}>
        <h2 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Projets actifs
          <span className="ml-1.5 text-[11px] font-normal tabular-nums text-glass-muted">
            ({projects.length})
          </span>
        </h2>
        <Link
          href="/projects"
          className={cn(dashboardLink, "inline-flex items-center gap-0.5 text-[10px]")}
        >
          Tous les projets
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div
        className={cn(
          dashboardMobileScrollRow,
          "gap-2.5 p-3 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {projects.map((project) => (
          <div key={project.id} className={cn(dashboardMobileScrollItem, "w-[11.5rem] md:w-auto")}>
            <DashboardProjectGlassCard project={project} />
          </div>
        ))}
      </div>
    </section>
  );
}
