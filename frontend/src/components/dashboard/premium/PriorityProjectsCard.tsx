"use client";

import Link from "next/link";
import DashboardCard from "../DashboardCard";
import DashboardProjectListRow from "../DashboardProjectListRow";
import { pickPriorityProjects, isProjectUrgent } from "./dashboard-utils";
import type { Project } from "@/types";

interface PriorityProjectsCardProps {
  projects?: Project[];
}

export default function PriorityProjectsCard({ projects = [] }: PriorityProjectsCardProps) {
  const priority = pickPriorityProjects(projects);

  return (
    <DashboardCard variant="glass">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Projets prioritaires</h2>
          <p className="text-xs text-slate-500">Urgent, deadline proche ou récemment actifs</p>
        </div>
        <Link
          href="/projects"
          className="text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          Tous les projets →
        </Link>
      </div>

      {priority.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">Aucun projet en cours.</p>
      ) : (
        <div className="space-y-2">
          {priority.map((project) => {
            const urgent = isProjectUrgent(project);
            const isNew =
              Date.now() - new Date(project.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;

            return (
              <div key={project.id} className="relative">
                {(urgent || isNew) && (
                  <div className="absolute -top-1 right-3 z-10 flex gap-1">
                    {urgent && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                        Urgent
                      </span>
                    )}
                    {isNew && !urgent && (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                        Nouveau
                      </span>
                    )}
                  </div>
                )}
                <DashboardProjectListRow project={project} />
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
