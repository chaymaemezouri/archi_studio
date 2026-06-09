"use client";

import { AlertTriangle, Archive, CheckCircle2, FolderKanban, Star, TrendingUp } from "lucide-react";
import { computeProjectsListStats } from "@/lib/projects-list";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectsStatsProps {
  projects: Project[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200/90 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <span className={cn("rounded-lg p-1.5", accent ?? "bg-stone-100 text-stone-600")}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums text-stone-900">{value}</p>
    </div>
  );
}

export default function ProjectsStats({ projects }: ProjectsStatsProps) {
  const stats = computeProjectsListStats(projects);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        label="Projets actifs"
        value={stats.active}
        icon={FolderKanban}
        accent="bg-orange-50 text-[#E07820]"
      />
      <StatCard
        label="En retard"
        value={stats.overdue}
        icon={AlertTriangle}
        accent="bg-red-50 text-red-600"
      />
      <StatCard
        label="Urgents"
        value={stats.urgent}
        icon={TrendingUp}
        accent="bg-amber-50 text-amber-700"
      />
      <StatCard
        label="Favoris"
        value={stats.favorites}
        icon={Star}
        accent="bg-amber-50/80 text-amber-600"
      />
      <StatCard
        label="Archivés"
        value={stats.archived}
        icon={Archive}
        accent="bg-stone-100 text-stone-600"
      />
      <StatCard
        label="Livrés"
        value={stats.delivered}
        icon={CheckCircle2}
        accent="bg-emerald-50 text-emerald-700"
      />
    </div>
  );
}
