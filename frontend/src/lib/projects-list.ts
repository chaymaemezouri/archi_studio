import {
  filterProjects,
  isProjectArchived,
  isProjectDelivered,
  isProjectOverdue,
  isProjectUrgent,
  type ProjectFilter,
} from "@/lib/project-status";
import { computeProjectOverallProgress } from "@/lib/project-progress";
import type { Project, ProjectPhase } from "@/types";
import { isPersonalProject, isStudioProject } from "@/lib/project-visibility";

export type ProjectsMainFilter =
  | ProjectFilter
  | "favorites"
  | "archived"
  | "shared"
  | "personal"
  | "all";

export type ProjectsSort =
  | "updated"
  | "updated_asc"
  | "name"
  | "name_desc"
  | "deadline"
  | "deadline_desc"
  | "progress"
  | "progress_asc"
  | "activity";

export function applyProjectsMainFilter(
  projects: Project[],
  filter: ProjectsMainFilter
): Project[] {
  if (filter === "archived") {
    return projects.filter((p) => p.status === "ARCHIVED");
  }

  let list = projects.filter((p) => p.status === "ACTIVE");

  if (filter === "all") return list;
  if (filter === "favorites") return list.filter((p) => p.isFavorite);
  if (filter === "shared") return list.filter((p) => isStudioProject(p));
  if (filter === "personal") return list.filter((p) => isPersonalProject(p));

  const dashboardFilters: ProjectFilter[] = ["urgent", "overdue", "recent"];
  if (dashboardFilters.includes(filter as ProjectFilter)) {
    return filterProjects(list, filter as ProjectFilter);
  }

  return list;
}

export function applyProjectsPhaseFilter(
  projects: Project[],
  phase: ProjectPhase | null
): Project[] {
  if (!phase) return projects;
  return projects.filter((p) => p.phase === phase);
}

export function applyProjectsScaleFilter(
  projects: Project[],
  scale: import("@/types").ProjectScale | null
): Project[] {
  if (!scale) return projects;
  return projects.filter((p) => p.projectScale === scale);
}

export function applyProjectsCategoryFilter(
  projects: Project[],
  category: import("@/types").ProjectCategory | null
): Project[] {
  if (!category) return projects;
  return projects.filter((p) => (p.projectCategory ?? "PRIVATE") === category);
}

export function applyProjectsNatureFilter(
  projects: Project[],
  nature: string | null
): Project[] {
  if (!nature) return projects;
  const q = nature.toLowerCase();
  return projects.filter((p) => (p.projectNature ?? "").toLowerCase() === q);
}

/** @deprecated use applyProjectsMainFilter + applyProjectsPhaseFilter */
export type ProjectsListFilter = ProjectsMainFilter | ProjectPhase;

export function applyProjectsFilter(
  projects: Project[],
  filter: ProjectsListFilter
): Project[] {
  const phases: ProjectPhase[] = [
    "ESQUISSE",
    "APS",
    "APD",
    "DCE",
    "EXECUTION",
    "CHANTIER",
    "LIVRE",
  ];
  if (phases.includes(filter as ProjectPhase)) {
    return applyProjectsPhaseFilter(
      applyProjectsMainFilter(projects, "all"),
      filter as ProjectPhase
    );
  }
  return applyProjectsMainFilter(projects, filter as ProjectsMainFilter);
}

export function searchProjects(projects: Project[], query: string): Project[] {
  const q = query.trim().toLowerCase();
  if (!q) return projects;

  return projects.filter((p) => {
    const haystack = [
      p.name,
      p.address,
      p.city,
      p.country,
      p.type,
      p.projectNature,
      p.projectCategory,
      p.projectScale,
      p.phase,
      p.description,
      p.url,
      p.client?.name,
      p.client?.company,
      p.manager?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function sortProjects(projects: Project[], sort: ProjectsSort): Project[] {
  const copy = [...projects];

  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    case "name_desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name, "fr"));
    case "progress":
      return copy.sort(
        (a, b) => computeProjectOverallProgress(b) - computeProjectOverallProgress(a)
      );
    case "progress_asc":
      return copy.sort(
        (a, b) => computeProjectOverallProgress(a) - computeProjectOverallProgress(b)
      );
    case "deadline":
      return copy.sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return da - db;
      });
    case "deadline_desc":
      return copy.sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : -Infinity;
        const db = b.deadline ? new Date(b.deadline).getTime() : -Infinity;
        return db - da;
      });
    case "updated_asc":
      return copy.sort(
        (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      );
    case "activity":
    case "updated":
    default:
      return copy.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }
}

export function computeProjectsListStats(projects: Project[]) {
  const active = projects.filter((p) => p.status === "ACTIVE");
  return {
    active: active.length,
    overdue: active.filter((p) => isProjectOverdue(p)).length,
    urgent: active.filter((p) => isProjectUrgent(p)).length,
    favorites: active.filter((p) => p.isFavorite).length,
    archived: projects.filter((p) => isProjectArchived(p)).length,
    delivered: active.filter((p) => isProjectDelivered(p)).length,
  };
}

export function countOverdueActive(projects: Project[]): number {
  return computeProjectsListStats(projects).overdue;
}
