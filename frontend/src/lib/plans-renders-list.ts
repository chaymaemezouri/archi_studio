import type { PlanRender, PlanRenderKind } from "@/types";
import { PLAN_CATEGORY_LABELS, RENDER_CATEGORY_LABELS } from "@/types";

export type PlanRenderMainFilter =
  | "all"
  | "plans"
  | "renders"
  | "unclassified"
  | "recent"
  | "favorites";

export type PlanRenderLinkFilter = "all" | "project" | "client" | "unclassified";

export type PlanRenderSort =
  | "recent"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "type"
  | "project"
  | "size";

export function canPreviewPlanRender(asset: PlanRender): boolean {
  return (
    asset.mimeType.startsWith("image/") ||
    asset.mimeType.includes("pdf") ||
    asset.fileType === "PDF" ||
    asset.fileType === "IMAGE"
  );
}

export function searchPlanRenders(items: PlanRender[], query: string): PlanRender[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter((a) => {
    const hay = [
      a.name,
      a.description,
      a.category,
      a.kind,
      a.version,
      a.projectName,
      a.clientName,
      ...(a.tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function applyMainFilter(
  items: PlanRender[],
  filter: PlanRenderMainFilter
): PlanRender[] {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  switch (filter) {
    case "plans":
      return items.filter((a) => a.kind === "PLAN");
    case "renders":
      return items.filter((a) => a.kind === "RENDER");
    case "unclassified":
      return items.filter((a) => !a.projectId && !a.clientId);
    case "recent":
      return items.filter(
        (a) => new Date(a.uploadedAt ?? a.createdAt) >= weekAgo
      );
    case "favorites":
      return items.filter((a) => a.isFavorite);
    case "all":
    default:
      return items;
  }
}

export function applyCategoryFilter(
  items: PlanRender[],
  category: string | "all"
): PlanRender[] {
  if (category === "all") return items;
  return items.filter((a) => a.category === category);
}

export function applyLinkFilter(
  items: PlanRender[],
  filter: PlanRenderLinkFilter
): PlanRender[] {
  switch (filter) {
    case "project":
      return items.filter((a) => !!a.projectId);
    case "client":
      return items.filter((a) => !!a.clientId);
    case "unclassified":
      return items.filter((a) => !a.projectId && !a.clientId);
    default:
      return items;
  }
}

export function sortPlanRenders(items: PlanRender[], sort: PlanRenderSort): PlanRender[] {
  const list = [...items];
  switch (sort) {
    case "oldest":
      return list.sort(
        (a, b) =>
          new Date(a.uploadedAt ?? a.createdAt).getTime() -
          new Date(b.uploadedAt ?? b.createdAt).getTime()
      );
    case "name_asc":
      return list.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    case "name_desc":
      return list.sort((a, b) => b.name.localeCompare(a.name, "fr"));
    case "type":
      return list.sort((a, b) => a.category.localeCompare(b.category, "fr"));
    case "project":
      return list.sort((a, b) =>
        (a.projectName ?? "").localeCompare(b.projectName ?? "", "fr")
      );
    case "size":
      return list.sort((a, b) => b.size - a.size);
    case "recent":
    default:
      return list.sort(
        (a, b) =>
          new Date(b.uploadedAt ?? b.createdAt).getTime() -
          new Date(a.uploadedAt ?? a.createdAt).getTime()
      );
  }
}

export function filterAndSortPlanRenders(
  items: PlanRender[],
  options: {
    query: string;
    mainFilter: PlanRenderMainFilter;
    categoryFilter: string | "all";
    linkFilter: PlanRenderLinkFilter;
    sort: PlanRenderSort;
  }
): PlanRender[] {
  let list = searchPlanRenders(items, options.query);
  if (options.mainFilter !== "all") {
    list = applyMainFilter(list, options.mainFilter);
  }
  list = applyCategoryFilter(list, options.categoryFilter);
  if (options.linkFilter !== "all" && options.mainFilter !== "unclassified") {
    list = applyLinkFilter(list, options.linkFilter);
  }
  return sortPlanRenders(list, options.sort);
}

export function formatPlanRenderSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export const PLAN_ACCEPT =
  ".pdf,.dwg,.jpg,.jpeg,.png,.webp,.zip";
export const RENDER_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.pdf,.zip";

export function categoryLabel(asset: PlanRender): string {
  if (asset.kind === "PLAN") {
    return PLAN_CATEGORY_LABELS[asset.category] ?? asset.category;
  }
  return RENDER_CATEGORY_LABELS[asset.category] ?? asset.category;
}

export interface PlanRenderProjectGroup {
  key: string;
  projectId: string | null;
  clientId: string | null;
  projectName: string;
  clientName?: string | null;
  renders: PlanRender[];
  plans: PlanRender[];
}

function groupKey(asset: PlanRender): string {
  if (asset.projectId) return `project:${asset.projectId}`;
  if (asset.clientId) return `client:${asset.clientId}`;
  return "unclassified";
}

function groupTitle(asset: PlanRender): string {
  if (asset.projectName) return asset.projectName;
  if (asset.clientName) return `Client · ${asset.clientName}`;
  return "Sans projet";
}

/** Regroupe les assets par projet, avec plans et rendus séparés. */
export function groupPlanRendersByProject(
  items: PlanRender[],
  sort: PlanRenderSort = "recent"
): PlanRenderProjectGroup[] {
  const map = new Map<string, PlanRenderProjectGroup>();

  for (const asset of items) {
    const key = groupKey(asset);
    if (!map.has(key)) {
      map.set(key, {
        key,
        projectId: asset.projectId ?? null,
        clientId: asset.clientId ?? null,
        projectName: groupTitle(asset),
        clientName: asset.clientName,
        renders: [],
        plans: [],
      });
    }
    const group = map.get(key)!;
    if (asset.kind === "RENDER") group.renders.push(asset);
    else group.plans.push(asset);
  }

  for (const group of map.values()) {
    group.renders = sortPlanRenders(group.renders, sort);
    group.plans = sortPlanRenders(group.plans, sort);
  }

  return Array.from(map.values()).sort((a, b) => {
    const aUnclassified = a.key === "unclassified";
    const bUnclassified = b.key === "unclassified";
    if (aUnclassified && !bUnclassified) return 1;
    if (!aUnclassified && bUnclassified) return -1;
    return a.projectName.localeCompare(b.projectName, "fr");
  });
}
