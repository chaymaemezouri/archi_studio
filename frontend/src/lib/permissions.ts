import type { Project, User } from "@/types";

export function canCreateProject(user: User | null | undefined): boolean {
  return Boolean(user);
}

export function canEditProject(user: User | null | undefined, _project?: Project): boolean {
  return Boolean(user);
}

export function canArchiveProject(user: User | null | undefined): boolean {
  return user?.role === "OWNER";
}

export function canDeleteProject(
  user: User | null | undefined,
  project?: Pick<Project, "studioId"> | null,
): boolean {
  if (user?.role !== "OWNER") return false;
  if (project?.studioId && user.studioId !== project.studioId) return false;
  return true;
}

export function canAddProjectContent(user: User | null | undefined): boolean {
  return Boolean(user);
}
