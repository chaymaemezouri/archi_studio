import {
  Activity,
  Calendar,
  CheckSquare,
  FileText,
  HardHat,
  Image,
  LayoutGrid,
  ListTodo,
  Map,
  StickyNote,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { filterProjectFiles } from "@/lib/project-detail";
import type { Project } from "@/types";

export const PROJECT_SECTIONS = [
  { id: "overview", label: "Aperçu général", icon: LayoutGrid },
  { id: "checklist", label: "Checklist", icon: CheckSquare },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "plans", label: "Plans", icon: Map },
  { id: "renders", label: "Rendus", icon: Image },
  { id: "tasks", label: "Tâches", icon: ListTodo },
  { id: "planning", label: "Deadlines", icon: Calendar },
  { id: "meetings", label: "Réunions", icon: Users },
  { id: "chantier", label: "Chantier", icon: HardHat },
  { id: "finances", label: "Finances", icon: Wallet },
  { id: "activity", label: "Activité", icon: Activity },
] as const;

export type ProjectTabId = (typeof PROJECT_SECTIONS)[number]["id"];

export type ProjectSection = (typeof PROJECT_SECTIONS)[number];

/** @deprecated Utiliser PROJECT_SECTIONS — conservé pour compatibilité */
export const PROJECT_TABS = PROJECT_SECTIONS.map(({ id, label }) => ({ id, label }));

export function getProjectSectionCount(
  project: Project | undefined,
  sectionId: ProjectTabId
): number | null {
  if (!project) return null;
  switch (sectionId) {
    case "checklist":
      return project.checklistItems?.length ?? 0;
    case "notes": {
      const n = project.projectNotes?.length ?? 0;
      if (n > 0) return n;
      return project.notes?.trim() ? 1 : null;
    }
    case "documents": {
      const docs = filterProjectFiles(project.files, "document").length;
      const cps =
        project.files?.filter((f) => {
          const t = (f.fileType || "").toUpperCase();
          return t.includes("CPS") || t.includes("BPU");
        }).length ?? 0;
      return docs + cps + (project.documents?.length ?? 0);
    }
    case "plans":
      return filterProjectFiles(project.files, "plan").length;
    case "renders":
      return filterProjectFiles(project.files, "render").length;
    case "tasks":
      return project.tasks?.length ?? 0;
    case "planning":
      return project.deadlines?.length ?? 0;
    case "meetings":
      return project.meetings?.length ?? 0;
    case "chantier":
      return project.chantierLogs?.length ?? 0;
    case "finances":
      return (project.devis?.length ?? 0) + (project.invoices?.length ?? 0);
    case "activity":
      return project.activityLogs?.length ?? 0;
    default:
      return null;
  }
}

export function getProjectSectionById(id: ProjectTabId): ProjectSection {
  return PROJECT_SECTIONS.find((s) => s.id === id) ?? PROJECT_SECTIONS[0];
}

export function getProjectSectionIcon(id: ProjectTabId): LucideIcon {
  return getProjectSectionById(id).icon;
}
