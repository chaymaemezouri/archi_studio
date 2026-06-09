"use client";

import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import DashboardProjectCard from "./DashboardProjectCard";
import DashboardProjectListRow from "./DashboardProjectListRow";
import Tooltip from "@/components/ui/Tooltip";
import { pickPriorityProjects } from "./dashboard-executive";
import {
  dashboardLink,
  dashboardSection,
  dashboardViewBtn,
  dashboardViewToggle,
} from "./dashboard-ui";
import type { Project, Task } from "@/types";
import { cn } from "@/lib/utils";

interface PriorityProjectsSectionProps {
  projects?: Project[];
  tasks?: Task[];
  maxItems?: number;
}

export default function PriorityProjectsSection({
  projects = [],
  tasks = [],
  maxItems = 4,
}: PriorityProjectsSectionProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  const priority = useMemo(
    () => pickPriorityProjects(projects, maxItems),
    [projects, maxItems]
  );

  return (
    <section className={dashboardSection}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-app-primary">
            Projets prioritaires
          </h2>
          <p className="mt-0.5 text-xs text-glass-muted">
            Urgents, en retard ou deadline proche
          </p>
        </div>
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

      {priority.length === 0 ? (
        <p className="py-8 text-center text-sm text-glass-muted">
          Aucun projet ne demande votre attention pour le moment.
        </p>
      ) : view === "grid" ? (
        <div
          className={cn(
            "grid items-stretch gap-3",
            priority.length === 1 && "grid-cols-1",
            priority.length === 2 && "grid-cols-1 sm:grid-cols-2",
            priority.length >= 3 && "grid-cols-1 sm:grid-cols-2"
          )}
        >
          {priority.map((project) => (
            <DashboardProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {priority.map((project) => (
            <DashboardProjectListRow key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
