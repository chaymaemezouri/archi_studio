"use client";

import Link from "next/link";
import DocumentGridView from "./DocumentGridView";
import DocumentRow, { DocumentListHeader } from "./DocumentRow";
import { documentsListTable, documentsShell } from "./documents-list-ui";
import type { DocumentProjectGroup } from "@/lib/documents-list";
import type { Document } from "@/types";
import { accentBar } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface DocumentProjectSectionProps {
  group: DocumentProjectGroup;
  view: "list" | "grid";
  onEdit: (doc: Document) => void;
  onPreview: (doc: Document) => void;
  projects?: { id: string; name: string }[];
  onLinkProject?: (doc: Document, projectId: string) => void;
}

export default function DocumentProjectSection({
  group,
  view,
  onEdit,
  onPreview,
  projects,
  onLinkProject,
}: DocumentProjectSectionProps) {
  const href = group.projectId
    ? `/projects/${group.projectId}`
    : group.clientId
      ? `/clients/${group.clientId}`
      : undefined;

  const count = group.documents.length;

  return (
    <section className={cn(documentsShell, "space-y-3 p-3 sm:p-4")}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-app pb-2.5">
        <div className="min-w-0">
          {href ? (
            <Link
              href={href}
              className="flex items-center gap-2 text-[15px] font-semibold text-app-primary transition hover:text-studio-light"
            >
              <span className={cn(accentBar, "h-3.5")} aria-hidden />
              <span className="truncate">{group.projectName}</span>
            </Link>
          ) : (
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-app-primary">
              <span className={cn(accentBar, "h-3.5")} aria-hidden />
              <span className="truncate">{group.projectName}</span>
            </h2>
          )}
          <p className="mt-0.5 pl-3 text-[11px] text-glass-muted">
            {count} document{count !== 1 ? "s" : ""}
            {group.clientName && group.projectId && (
              <span> · {group.clientName}</span>
            )}
          </p>
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-[11px] font-medium text-glass-muted transition hover:text-studio-light"
          >
            {group.projectId ? "Voir le projet →" : "Voir le client →"}
          </Link>
        )}
      </header>

      {count === 0 ? (
        <p className="px-2 py-4 text-center text-[12px] text-glass-muted">
          Aucun document dans ce groupe.
        </p>
      ) : view === "grid" ? (
        <DocumentGridView
          documents={group.documents}
          onEdit={onEdit}
          onPreview={onPreview}
        />
      ) : (
        <div className={documentsListTable}>
          <DocumentListHeader />
          {group.documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              onEdit={onEdit}
              onPreview={onPreview}
              projects={!doc.projectId ? projects : undefined}
              onLinkProject={onLinkProject}
            />
          ))}
        </div>
      )}
    </section>
  );
}
