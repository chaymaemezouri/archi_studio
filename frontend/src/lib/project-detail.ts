import { PHASE_LABELS, type Project, type ProjectFile, type ProjectPhase, type User } from "@/types";
import { getDetailPhasesForProject } from "@/lib/project-phases";

const ALL_PHASES: ProjectPhase[] = [
  "ESQUISSE",
  "CONSULTATION",
  "APS",
  "APD",
  "CPS",
  "AUTORISATION",
  "DOSSIER_EXECUTION",
  "DCE",
  "EXECUTION",
  "CHANTIER",
  "LIVRE",
];

/** Phases affichées dans l’aperçu détail selon la catégorie du projet. */
export function getProjectDetailPhases(project: Project): ProjectPhase[] {
  return getDetailPhasesForProject(project.projectCategory, project.phase);
}

/** @deprecated utiliser getProjectDetailPhases(project) */
export const PROJECT_DETAIL_PHASES: ProjectPhase[] = ALL_PHASES;

export function getPhaseIndex(phase: ProjectPhase, phases: ProjectPhase[] = ALL_PHASES): number {
  return phases.indexOf(phase);
}

export function getPhaseProgressPercent(
  phase: ProjectPhase,
  currentPhase: ProjectPhase,
  _globalProgress: number,
  phaseProgress: { phase: ProjectPhase; progress: number }[] = [],
  phases: ProjectPhase[] = ALL_PHASES
): number {
  const entry = phaseProgress.find((p) => p.phase === phase)?.progress;
  if (entry != null) return entry;
  const current = getPhaseIndex(currentPhase, phases);
  const idx = getPhaseIndex(phase, phases);
  if (current < 0 || idx < 0) return 0;
  if (idx < current) return 100;
  if (idx === current) return 0;
  return 0;
}

export function getPhaseBarColor(
  phase: ProjectPhase,
  currentPhase: ProjectPhase,
  percent: number,
  phases: ProjectPhase[] = ALL_PHASES
): string {
  const current = getPhaseIndex(currentPhase, phases);
  const idx = getPhaseIndex(phase, phases);
  if (percent >= 100 || (idx >= 0 && current >= 0 && idx < current)) return "bg-emerald-500";
  if (idx === current) return "bg-blue-500";
  return "bg-stone-200";
}

export function collectProjectTeam(project: Project): User[] {
  const map = new Map<string, User>();
  if (project.manager) {
    map.set(project.manager.id, project.manager as User);
  }
  for (const task of project.tasks ?? []) {
    if (task.assignee) map.set(task.assignee.id, task.assignee);
  }
  return Array.from(map.values());
}

export function filterCpsBpuFiles(files: ProjectFile[] = []): ProjectFile[] {
  return files.filter((f) => {
    const t = (f.fileType || "").toUpperCase();
    return t.includes("CPS") || t.includes("BPU");
  });
}

export function filterProjectFiles(
  files: ProjectFile[] = [],
  kind: "document" | "plan" | "render" | "cps"
): ProjectFile[] {
  if (kind === "cps") return filterCpsBpuFiles(files);
  const normalized = files.map((f) => ({
    ...f,
    type: (f.fileType || "").toUpperCase(),
  }));

  if (kind === "plan") {
    return normalized.filter(
      (f) => f.type.includes("PLAN") || f.mimeType?.includes("dwg")
    );
  }
  if (kind === "render") {
    return normalized.filter(
      (f) =>
        f.type.includes("RENDER") ||
        f.type.includes("RENDU") ||
        (f.mimeType?.startsWith("image/") && f.type.includes("RENDER"))
    );
  }
  return normalized.filter(
    (f) =>
      !f.type.includes("PLAN") &&
      !f.type.includes("RENDER") &&
      !f.type.includes("RENDU") &&
      !(f.mimeType?.startsWith("image/") && f.type.includes("RENDER"))
  );
}

export type ProjectVisualItem = { id: string; url: string };

/** Rendus — planRenders (API) ou fichiers legacy */
export function getProjectRenders(project: Project): ProjectVisualItem[] {
  const fromPlanRenders = (project.planRenders ?? [])
    .filter((a) => a.kind === "RENDER")
    .map((a) => ({ id: a.id, url: a.url }));

  if (fromPlanRenders.length > 0) return fromPlanRenders;

  return filterProjectFiles(project.files, "render").map((f) => ({
    id: f.id,
    url: f.url,
  }));
}

/** Visuels pour l'aperçu : rendus, puis photo de couverture, puis plans image */
export function getProjectVisualPreviewItems(
  project: Project,
  limit = 4
): ProjectVisualItem[] {
  const seen = new Set<string>();
  const items: ProjectVisualItem[] = [];

  const push = (id: string, url: string) => {
    if (!url?.trim() || seen.has(url)) return;
    seen.add(url);
    items.push({ id, url });
  };

  for (const r of getProjectRenders(project)) {
    push(r.id, r.url);
    if (items.length >= limit) return items;
  }

  if (project.imageUrl) {
    push("cover", project.imageUrl);
    if (items.length >= limit) return items;
  }

  const imagePlans = (project.planRenders ?? []).filter(
    (p) => p.kind === "PLAN" && (p.mimeType?.startsWith("image/") ?? true)
  );
  for (const p of imagePlans) {
    push(p.id, p.url);
    if (items.length >= limit) return items;
  }

  for (const f of filterProjectFiles(project.files, "plan")) {
    if (f.mimeType?.startsWith("image/")) {
      push(f.id, f.url);
      if (items.length >= limit) return items;
    }
  }

  return items;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatProjectActivityMessage(activity: {
  action: string;
  entity: string;
  user?: { name?: string } | null;
  details?: Record<string, unknown> | null;
}): string {
  const who = activity.user?.name ?? "Vous";
  const name =
    typeof activity.details?.name === "string" ? activity.details.name : null;
  const action = activity.action.toUpperCase();

  if (activity.entity === "ProjectFile" || activity.entity === "Document") {
    if (action === "CREATE") {
      return name ? `${who} a ajouté le document « ${name} »` : `${who} a ajouté un document`;
    }
    if (action === "DELETE") {
      return name ? `${who} a supprimé « ${name} »` : `${who} a supprimé un document`;
    }
    return name ? `${who} a mis à jour « ${name} »` : `${who} a mis à jour un document`;
  }
  if (activity.entity === "Project") {
    if (action === "CREATE") return `${who} a créé le projet`;
    if (action === "UPDATE") return `${who} a modifié le projet`;
  }
  if (activity.entity === "Task") {
    if (action === "CREATE") {
      return name ? `${who} a créé la tâche « ${name} »` : `${who} a créé une tâche`;
    }
    if (
      action === "COMPLETE" ||
      action === "COMPLETED" ||
      activity.details?.status === "DONE"
    ) {
      return name ? `${who} a terminé « ${name} »` : `${who} a terminé une tâche`;
    }
    if (action === "DELETE") {
      return name ? `${who} a supprimé la tâche « ${name} »` : `${who} a supprimé une tâche`;
    }
    if (action === "UPDATE") {
      return name ? `${who} a mis à jour « ${name} »` : `${who} a mis à jour une tâche`;
    }
  }
  if (activity.entity === "Deadline") {
    if (action === "CREATE") {
      return name ? `${who} a créé la deadline « ${name} »` : `${who} a créé une deadline`;
    }
    if (action === "UPDATE") return `${who} a modifié une deadline`;
    if (action === "DELETE") return `${who} a supprimé une deadline`;
  }
  if (activity.entity === "Meeting") {
    if (action === "CREATE") {
      return name ? `${who} a planifié « ${name} »` : `${who} a planifié une réunion`;
    }
    if (action === "UPDATE") return `${who} a modifié une réunion`;
    if (action === "DELETE") return `${who} a supprimé une réunion`;
  }
  if (activity.entity === "Payment") {
    if (action === "CREATE") return `${who} a enregistré un paiement`;
  }
  if (activity.entity === "Devis") {
    if (action === "CREATE") return `${who} a créé un devis`;
    if (action === "UPDATE") return `${who} a modifié un devis`;
  }
  if (activity.entity === "Invoice") {
    if (action === "CREATE") return `${who} a créé une facture`;
    if (action === "UPDATE") return `${who} a modifié une facture`;
  }
  if (activity.entity === "ChantierLog") {
    if (action === "CREATE") return `${who} a ajouté une note de chantier`;
    if (action === "UPDATE") return `${who} a mis à jour le journal de chantier`;
  }
  if (activity.entity === "ProjectChecklistItem" || activity.entity === "ChecklistItem") {
    if (action === "UPDATE") return `${who} a mis à jour la checklist`;
    if (action === "CREATE") return `${who} a ajouté un élément à la checklist`;
  }
  if (activity.entity === "PlanRender") {
    if (action === "CREATE") return `${who} a ajouté un plan ou rendu`;
    if (action === "DELETE") return `${who} a supprimé un plan ou rendu`;
  }

  const actionLabels: Record<string, string> = {
    CREATE: "a créé",
    UPDATE: "a modifié",
    DELETE: "a supprimé",
    COMPLETE: "a terminé",
    COMPLETED: "a terminé",
  };
  const entityLabels: Record<string, string> = {
    Project: "le projet",
    Task: "une tâche",
    Deadline: "une deadline",
    Meeting: "une réunion",
    ProjectFile: "un document",
    Document: "un document",
    Payment: "un paiement",
    Devis: "un devis",
    Invoice: "une facture",
    ChantierLog: "une entrée de chantier",
  };
  const actionLabel = actionLabels[action] ?? "a mis à jour";
  const entityLabel = entityLabels[activity.entity] ?? "un élément";
  return `${who} ${actionLabel} ${entityLabel}`;
}

export function phaseLabel(phase: ProjectPhase): string {
  return PHASE_LABELS[phase];
}

export function getChecklistStats(project: Project) {
  const items = project.checklistItems ?? [];
  const total = items.length;
  const added = items.filter(
    (i) => i.status === "UPLOADED" || i.status === "VALIDATED"
  ).length;
  const validated = items.filter((i) => i.status === "VALIDATED").length;
  const missing = items.filter((i) => i.status === "MISSING").length;
  return { total, added, validated, missing };
}

export function getFinanceFollowUpCount(project: Project): number {
  const pending = new Set(["UNPAID", "PARTIAL", "OVERDUE", "SENT"]);
  return (project.invoices ?? []).filter((inv) => pending.has(inv.status)).length;
}
