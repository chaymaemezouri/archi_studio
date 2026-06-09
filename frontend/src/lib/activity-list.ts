import type { ActivityLog } from "@/types";
import type { ProjectTabId } from "@/components/projects/detail/ProjectDetailTabs";

export type ActivityPeriodFilter = "all" | "today" | "week" | "month" | "year" | "custom";
export type ActivitySort = "recent" | "oldest";

export const ACTIVITY_ENTITY_LABELS: Record<string, string> = {
  Project: "Projet",
  Task: "Tâche",
  Document: "Document",
  ProjectFile: "Fichier",
  Devis: "Devis",
  Invoice: "Facture",
  Payment: "Paiement",
  Meeting: "Réunion",
  Deadline: "Deadline",
  PlanRender: "Plan / Rendu",
  ChantierLog: "Chantier",
  Client: "Client",
  ProjectChecklistItem: "Checklist",
  ChecklistItem: "Checklist",
};

export const ACTIVITY_ENTITY_FILTERS = [
  { id: "all", label: "Tous les types" },
  ...Object.entries(ACTIVITY_ENTITY_LABELS).map(([id, label]) => ({ id, label })),
];

export interface ActivityListFilters {
  query: string;
  period: ActivityPeriodFilter;
  customFrom?: string;
  customTo?: string;
  entity: string;
  projectId: string;
  sort: ActivitySort;
}

function inPeriod(
  dateStr: string,
  period: ActivityPeriodFilter,
  customFrom?: string,
  customTo?: string
): boolean {
  if (period === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();
  if (period === "today") return date.toDateString() === now.toDateString();
  if (period === "week") {
    const start = new Date(now);
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  }
  if (period === "month") {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (period === "year") return date.getFullYear() === now.getFullYear();
  if (period === "custom") {
    if (customFrom && date < new Date(customFrom)) return false;
    if (customTo) {
      const end = new Date(customTo);
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }
    return true;
  }
  return true;
}

function matchesQuery(log: ActivityLog, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    log.user?.name,
    log.project?.name,
    log.client?.name,
    log.action,
    log.entity,
    log.entityId,
    typeof log.details?.name === "string" ? log.details.name : null,
    typeof log.details?.title === "string" ? log.details.title : null,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function filterActivityLogs(
  logs: ActivityLog[],
  filters: ActivityListFilters
): ActivityLog[] {
  let list = logs.filter((log) => {
    if (filters.entity !== "all" && log.entity !== filters.entity) return false;
    if (filters.projectId !== "all" && log.projectId !== filters.projectId) return false;
    if (!inPeriod(log.createdAt, filters.period, filters.customFrom, filters.customTo)) {
      return false;
    }
    return matchesQuery(log, filters.query);
  });

  list = [...list].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return filters.sort === "oldest" ? ta - tb : tb - ta;
  });

  const seen = new Set<string>();
  return list.filter((log) => {
    const key = `${log.action}-${log.entity}-${log.entityId ?? ""}-${log.createdAt.slice(0, 16)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getActivityProjectTab(entity: string): ProjectTabId | null {
  switch (entity) {
    case "Task":
      return "tasks";
    case "Document":
    case "ProjectFile":
      return "documents";
    case "PlanRender":
      return "plans";
    case "Meeting":
      return "meetings";
    case "Deadline":
      return "planning";
    case "Devis":
    case "Invoice":
    case "Payment":
      return "finances";
    case "ChantierLog":
      return "chantier";
    case "ProjectChecklistItem":
    case "ChecklistItem":
      return "checklist";
    default:
      return null;
  }
}

export interface ActivityLink {
  label: string;
  href: string;
}

export function getActivityLinks(log: ActivityLog): ActivityLink[] {
  const links: ActivityLink[] = [];
  const projectId = log.projectId ?? undefined;
  const clientId = log.clientId ?? undefined;

  if (projectId) {
    links.push({ label: "Ouvrir le projet", href: `/projects/${projectId}` });
    const tab = getActivityProjectTab(log.entity);
    if (tab && tab !== "overview") {
      links.push({
        label: "Voir dans le projet",
        href: `/projects/${projectId}?tab=${tab}`,
      });
    }
  }

  if (clientId) {
    links.push({ label: "Ouvrir le client", href: `/clients/${clientId}` });
  }

  if (log.entity === "Devis" && log.entityId) {
    links.push({
      label: "Ouvrir le devis",
      href: `/finances/quotes-invoices?edit=devis&id=${log.entityId}`,
    });
  }

  if (log.entity === "Invoice" && log.entityId) {
    links.push({ label: "Ouvrir la facture", href: `/invoices/${log.entityId}` });
  }

  if (log.entity === "Payment") {
    links.push({ label: "Voir les paiements", href: "/payments" });
  }

  if (log.entity === "Devis" || log.entity === "Invoice") {
    links.push({
      label: "Devis & factures",
      href: "/finances/quotes-invoices",
    });
  }

  if (log.entity === "Document") {
    links.push({ label: "Voir les documents", href: "/documents" });
  }

  if (log.entity === "PlanRender") {
    links.push({ label: "Plans & rendus", href: "/plans-renders" });
  }

  return links;
}
