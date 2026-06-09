import type { Document, DocumentCategory, DocumentFileType } from "@/types";

export type DocumentTypeFilter = "all" | DocumentFileType;
export type DocumentCategoryFilter = "all" | DocumentCategory;
export type DocumentLinkFilter = "all" | "project" | "client" | "unclassified";
export type DocumentDateFilter = "all" | "recent" | "month" | "year";
export type DocumentSort =
  | "recent"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "size"
  | "type";

export function inferDocumentType(mimeType: string, name: string): DocumentFileType {
  const mime = mimeType.toLowerCase();
  const ext = name.toLowerCase().slice(name.lastIndexOf("."));
  if (mime.includes("pdf") || ext === ".pdf") return "PDF";
  if (mime.includes("wordprocessingml") || ext === ".docx" || ext === ".doc") return "DOCX";
  if (mime.includes("spreadsheetml") || ext === ".xlsx" || ext === ".xls") return "XLSX";
  if (ext === ".dwg" || mime.includes("dwg")) return "DWG";
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.includes("zip") || ext === ".zip") return "ZIP";
  return "OTHER";
}

export function canPreviewDocument(doc: Document): boolean {
  return (
    doc.mimeType.startsWith("image/") ||
    doc.mimeType.includes("pdf") ||
    doc.type === "PDF" ||
    doc.type === "IMAGE"
  );
}

export function searchDocuments(documents: Document[], query: string): Document[] {
  const q = query.trim().toLowerCase();
  if (!q) return documents;

  return documents.filter((d) => {
    const hay = [
      d.name,
      d.description,
      d.type,
      d.category,
      d.projectName,
      d.clientName,
      ...(d.tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function applyDocumentTypeFilter(
  documents: Document[],
  filter: DocumentTypeFilter
): Document[] {
  if (filter === "all") return documents;
  return documents.filter((d) => d.type === filter);
}

export function applyDocumentCategoryFilter(
  documents: Document[],
  filter: DocumentCategoryFilter
): Document[] {
  if (filter === "all") return documents;
  return documents.filter((d) => d.category === filter);
}

export function applyDocumentLinkFilter(
  documents: Document[],
  filter: DocumentLinkFilter
): Document[] {
  switch (filter) {
    case "project":
      return documents.filter((d) => !!d.projectId);
    case "client":
      return documents.filter((d) => !!d.clientId);
    case "unclassified":
      return documents.filter((d) => !d.projectId && !d.clientId);
    default:
      return documents;
  }
}

export function applyDocumentDateFilter(
  documents: Document[],
  filter: DocumentDateFilter
): Document[] {
  if (filter === "all") return documents;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  return documents.filter((d) => {
    const date = new Date(d.uploadedAt ?? d.createdAt);
    switch (filter) {
      case "recent":
        return date >= weekAgo;
      case "month":
        return date >= monthStart;
      case "year":
        return date >= yearStart;
      default:
        return true;
    }
  });
}

export function sortDocuments(documents: Document[], sort: DocumentSort): Document[] {
  const list = [...documents];
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
    case "size":
      return list.sort((a, b) => b.size - a.size);
    case "type":
      return list.sort((a, b) => a.type.localeCompare(b.type, "fr"));
    case "recent":
    default:
      return list.sort(
        (a, b) =>
          new Date(b.uploadedAt ?? b.createdAt).getTime() -
          new Date(a.uploadedAt ?? a.createdAt).getTime()
      );
  }
}

export function filterAndSortDocuments(
  documents: Document[],
  options: {
    query: string;
    typeFilter: DocumentTypeFilter;
    categoryFilter: DocumentCategoryFilter;
    linkFilter: DocumentLinkFilter;
    dateFilter: DocumentDateFilter;
    sort: DocumentSort;
  }
): Document[] {
  let list = searchDocuments(documents, options.query);
  list = applyDocumentTypeFilter(list, options.typeFilter);
  list = applyDocumentCategoryFilter(list, options.categoryFilter);
  list = applyDocumentLinkFilter(list, options.linkFilter);
  list = applyDocumentDateFilter(list, options.dateFilter);
  return sortDocuments(list, options.sort);
}

export function formatDocumentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export const ACCEPTED_DOCUMENT_EXTENSIONS =
  ".pdf,.doc,.docx,.xls,.xlsx,.dwg,.jpg,.jpeg,.png,.webp,.zip";
