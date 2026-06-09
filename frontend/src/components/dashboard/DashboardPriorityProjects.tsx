"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import DashboardProjectGlassCard from "@/components/projects/DashboardProjectGlassCard";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";

interface DashboardPriorityProjectsProps {
  projects: Project[];
  className?: string;
}

export default function DashboardPriorityProjects({
  projects,
  className,
}: DashboardPriorityProjectsProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-glass bg-[color:var(--glass-bg)]",
        "shadow-[var(--card-shadow),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-app px-3.5 py-2.5">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-app-primary">
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Priorités du jour
        </h2>
        <Link
          href="/projects"
          className="inline-flex items-center gap-0.5 text-[11px] font-medium text-glass-muted transition hover:text-studio-light"
        >
          Tout voir
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="px-3.5 py-6 text-center text-[12px] text-glass-muted">
          Aucun projet prioritaire pour le moment.
        </p>
      ) : (
        <div className="grid gap-2.5 p-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <DashboardProjectGlassCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
