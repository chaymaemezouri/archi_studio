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

export function canDeleteProject(user: User | null | undefined): boolean {
  return user?.role === "OWNER";
}

export function canAddProjectContent(user: User | null | undefined): boolean {
  return Boolean(user);
}
