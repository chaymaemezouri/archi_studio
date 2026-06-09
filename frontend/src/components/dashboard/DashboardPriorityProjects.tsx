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
        "rounded-xl border border-white/[0.08] bg-white/[0.035]",
        "shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2.5">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-white/90">
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Priorités du jour
        </h2>
        <Link
          href="/projects"
          className="inline-flex items-center gap-0.5 text-[11px] font-medium text-white/45 transition hover:text-studio-light"
        >
          Tout voir
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="px-3.5 py-6 text-center text-[12px] text-white/42">
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
