import { startOfDay } from "date-fns";
import { isOverdueDeadline } from "@/lib/dates";
import type { Project, ProjectFile } from "@/types";

export interface ProjectCounts {
  documentsCount: number;
  plansCount: number;
  rendersCount: number;
  openTasksCount: number;
  upcomingDeadlinesCount: number;
}

function classifyFile(file: ProjectFile): "document" | "plan" | "render" | "cover" {
  const t = (file.fileType || "").toUpperCase();
  if (t.includes("PLAN")) return "plan";
  if (t.includes("RENDER")) return "render";
  if (t === "IMAGE") return "cover";
  return "document";
}

export function getProjectCounts(project: Project): ProjectCounts {
  const files = project.files ?? [];
  let documentsCount = 0;
  let plansCount = 0;
  let rendersCount = 0;

  for (const file of files) {
    const kind = classifyFile(file);
    if (kind === "plan") plansCount++;
    else if (kind === "render") rendersCount++;
    else if (kind === "document") documentsCount++;
  }

  const openTasksCount =
    project.tasks?.filter((t) => t.status !== "DONE").length ??
    (project as Project & { _count?: { tasks?: number } })._count?.tasks ??
    0;

  const today = startOfDay(new Date());
  const upcomingDeadlinesCount = (project.deadlines ?? []).filter((d) => {
    if (d.done) return false;
    if (isOverdueDeadline(d.date, d.done)) return false;
    return startOfDay(new Date(d.date)) >= today;
  }).length;

  return {
    documentsCount,
    plansCount,
    rendersCount,
    openTasksCount,
    upcomingDeadlinesCount,
  };
}
