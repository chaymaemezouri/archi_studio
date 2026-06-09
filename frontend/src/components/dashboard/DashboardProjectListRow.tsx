"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { useUpdateProject } from "@/hooks/useProjects";
import { useCreateDeadline } from "@/hooks/useDashboard";
import {
  getProjectNextDeadline,
  isProjectOverdue,
} from "@/components/dashboard/dashboard-helpers";
import { PHASE_LABELS } from "@/types";
import type { Project } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toLocalDateInput } from "@/lib/dates";

interface DashboardProjectListRowProps {
  project: Project;
}

export default function DashboardProjectListRow({ project }: DashboardProjectListRowProps) {
  const updateProject = useUpdateProject();
  const createDeadline = useCreateDeadline();
  const nextDeadline = getProjectNextDeadline(project);
  const deadlineDate = nextDeadline?.date ?? project.deadline;
  const overdue = isProjectOverdue(project);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    updateProject.mutate({ id: project.id, isFavorite: !project.isFavorite });
  };

  const quickDeadline = async (e: React.MouseEvent) => {
    e.preventDefault();
    const title = window.prompt("Titre de la deadline :");
    if (!title?.trim()) return;
    await createDeadline.mutateAsync({
      title: title.trim(),
      date: toLocalDateInput(new Date()),
      projectId: project.id,
    });
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn(
        "flex items-center gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3 transition hover:shadow-sm",
        overdue && "border-red-300 bg-red-50/50"
      )}
    >
      <button
        type="button"
        onClick={toggleFavorite}
        className="shrink-0"
        aria-label="Favori"
      >
        <Star
          className={cn(
            "h-4 w-4",
            project.isFavorite ? "fill-amber-400 text-amber-400" : "text-stone-300"
          )}
        />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium capitalize text-stone-900">{project.name}</p>
        <p className="flex items-center gap-1 text-xs text-stone-500">
          <MapPin className="h-3 w-3" />
          {project.country || project.city || "—"} · {PHASE_LABELS[project.phase]}
        </p>
      </div>
      <div className="hidden w-24 sm:block">
        <div className="h-1.5 rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-[#E07820]"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <p className="mt-0.5 text-center text-xs text-stone-500">{project.progress}%</p>
      </div>
      <p className={cn("hidden text-xs md:block", overdue ? "font-medium text-red-600" : "text-stone-500")}>
        {deadlineDate ? formatDate(deadlineDate) : "—"}
      </p>
      <button
        type="button"
        onClick={quickDeadline}
        className="shrink-0 rounded-lg border border-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-50"
      >
        + Deadline
      </button>
    </Link>
  );
}
