import type { ProjectTabId } from "./ProjectDetailTabs";

export type ProjectQuickAddMode = "task" | "deadline" | "meeting" | "chantier";

export type ProjectUploadKind = "image" | "document" | "plan" | "render";

export interface ProjectDetailActions {
  projectId: string;
  onEdit: () => void;
  onTabChange: (tab: ProjectTabId) => void;
  onQuickAdd: (mode: ProjectQuickAddMode) => void;
  onUpload: (kind: ProjectUploadKind) => void;
}
