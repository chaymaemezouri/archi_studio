"use client";

import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import DashboardProjectCard from "./DashboardProjectCard";
import DashboardProjectListRow from "./DashboardProjectListRow";
import Tooltip from "@/components/ui/Tooltip";
import {
  dashboardLink,
  dashboardSection,
  dashboardViewBtn,
  dashboardViewToggle,
} from "./dashboard-ui";
import {
  filterProjects,
  type ProjectFilter,
} from "./dashboard-helpers";
import type { Project, Task } from "@/types";
import { cn } from "@/lib/utils";

const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "urgent", label: "Urgents" },
  { id: "overdue", label: "En retard" },
  { id: "recent", label: "Récents" },
];

interface ProjectsInProgressProps {
  projects?: Project[];
  tasks?: Task[];
}

export default function ProjectsInProgress({
  projects = [],
  tasks = [],
}: ProjectsInProgressProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<ProjectFilter>("all");

  const filtered = useMemo(
    () => filterProjects(projects, filter),
    [projects, filter]
  );

  return (
    <section className={dashboardSection}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold tracking-tight text-app-primary">Projets en cours</h2>
        <div className="flex items-center gap-2">
          <Link href="/projects" className={dashboardLink}>
            Voir tous
          </Link>
          <div className={dashboardViewToggle}>
            <Tooltip label="Vue grille">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={dashboardViewBtn(view === "grid")}
                aria-label="Vue grille"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip label="Vue liste">
              <button
                type="button"
                onClick={() => setView("list")}
                className={dashboardViewBtn(view === "list")}
                aria-label="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400",
              filter === f.id
                ? "bg-stone-900 text-white shadow-sm"
                : "text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-glass-secondary"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-glass-muted">
          {projects.length === 0
            ? "Aucun projet en cours."
            : "Aucun projet ne correspond à ce filtre."}
        </p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
          {filtered.map((project) => (
            <DashboardProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => (
            <DashboardProjectListRow key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
