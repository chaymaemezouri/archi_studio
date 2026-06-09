"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { useDialog } from "@/components/providers/DialogProvider";
import { useUpdateProject } from "@/hooks/useProjects";
import { useCreateDeadline } from "@/hooks/useDashboard";
import {
  getProjectNextDeadline,
  isProjectOverdue,
} from "@/components/dashboard/dashboard-helpers";
import { listLink, listRowBase } from "@/lib/theme-classes";
import { PHASE_LABELS } from "@/types";
import type { Project } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { toLocalDateInput } from "@/lib/dates";

interface DashboardProjectListRowProps {
  project: Project;
}

export default function DashboardProjectListRow({ project }: DashboardProjectListRowProps) {
  const { prompt } = useDialog();
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
    const title = await prompt({
      title: "Nouvelle deadline",
      label: "Titre de la deadline",
      placeholder: "Ex. Dépôt permis de construire",
    });
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
        listRowBase,
        "grid-cols-1 items-center gap-2 rounded-xl border border-glass bg-[color:var(--glass-bg)] px-3.5 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto]",
        overdue && "border-red-400/35 bg-red-500/[0.04]"
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-app-primary">{project.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-glass-muted">
          <span>{PHASE_LABELS[project.phase] ?? project.phase}</span>
          {project.city && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="h-3 w-3" aria-hidden />
              {project.city}
            </span>
          )}
          {deadlineDate && (
            <span className={overdue ? "text-red-400" : undefined}>
              {formatDate(deadlineDate)}
            </span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={quickDeadline}
          className={cn(listLink, "text-[11px] no-underline")}
        >
          + Deadline
        </button>
        <button
          type="button"
          onClick={toggleFavorite}
          className="shrink-0"
          aria-label="Favori"
        >
          <Star
            className={cn(
              "h-4 w-4",
              project.isFavorite ? "fill-amber-400 text-amber-400" : "text-glass-muted"
            )}
          />
        </button>
      </div>
    </Link>
  );
}
