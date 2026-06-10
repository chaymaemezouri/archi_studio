import type { Project, ProjectVisibility } from "@/types";

export const PROJECT_VISIBILITY_LABELS: Record<ProjectVisibility, string> = {
  STUDIO: "Commun (cabinet)",
  PERSONAL: "Projet personnel",
};

export function isStudioProject(project: Pick<Project, "visibility">): boolean {
  return (project.visibility ?? "STUDIO") === "STUDIO";
}

export function isPersonalProject(project: Pick<Project, "visibility">): boolean {
  return project.visibility === "PERSONAL";
}
