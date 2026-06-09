"use client";

import Link from "next/link";
import { Download, ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";
import { FileIcon } from "@/components/projects/detail/FileTypeIcon";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import { detailIconActionGroup } from "@/components/projects/detail/project-detail-ui";
import Badge from "@/components/ui/Badge";
import {
  documentsListHeader,
  documentsListLink,
  documentsListRow,
} from "./documents-list-ui";
import { useDeleteDocument } from "@/hooks/useDocuments";
import {
  canPreviewDocument,
  formatDocumentSize,
} from "@/lib/documents-list";
import { resolveMediaUrl } from "@/lib/assets";
import type { Document } from "@/types";
import { DOCUMENT_CATEGORY_LABELS, DOCUMENT_TYPE_LABELS } from "@/types";
import { cn, formatDate } from "@/lib/utils";

interface DocumentRowProps {
  doc: Document;
  onEdit: (doc: Document) => void;
  onPreview: (doc: Document) => void;
}

export function DocumentListHeader() {
  return (
    <div className={documentsListHeader}>
      <span>Document</span>
      <span>Type</span>
      <span>Catégorie</span>
      <span>Projet</span>
      <span>Client</span>
      <span>Taille</span>
      <span>Ajouté</span>
      <span className="text-right">Actions</span>
    </div>
  );
}

export default function DocumentRow({ doc, onEdit, onPreview }: DocumentRowProps) {
  const deleteDoc = useDeleteDocument();
  const href = resolveMediaUrl(doc.url) ?? doc.url;
  const previewable = canPreviewDocument(doc);

  const handleDelete = () => {
    if (!window.confirm(`Supprimer « ${doc.name} » ?`)) return;
    deleteDoc.mutate(doc.id);
  };

  return (
    <div className={documentsListRow}>
      <div className="flex min-w-0 items-center gap-3">
        <FileIcon mimeType={doc.mimeType} name={doc.name} className="h-8 w-8 shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-medium text-glass">{doc.name}</p>
          {doc.description && (
            <p className="line-clamp-1 text-[11px] text-glass-muted">{doc.description}</p>
          )}
        </div>
      </div>

      <span>
        <Badge variant="studio">{DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}</Badge>
      </span>

      <span className="text-glass-secondary">
        {DOCUMENT_CATEGORY_LABELS[doc.category] ?? doc.category}
      </span>

      <span className="text-glass-secondary">
        {doc.projectId && doc.projectName ? (
          <Link href={`/projects/${doc.projectId}?tab=documents`} className={documentsListLink}>
            {doc.projectName}
          </Link>
        ) : (
          "—"
        )}
      </span>

      <span className="text-glass-secondary">
        {doc.clientId && doc.clientName ? (
          <Link href={`/clients/${doc.clientId}?tab=documents`} className={documentsListLink}>
            {doc.clientName}
          </Link>
        ) : (
          "—"
        )}
      </span>

      <span className="text-glass-secondary">{formatDocumentSize(doc.size)}</span>

      <span className="text-glass-secondary">{formatDate(doc.uploadedAt ?? doc.createdAt)}</span>

      <div
        className={cn(detailIconActionGroup, "justify-self-end")}
        role="group"
        aria-label="Actions document"
      >
        {previewable ? (
          <IconActionButton
            label="Aperçu"
            icon={Eye}
            tone="view"
            onClick={() => onPreview(doc)}
          />
        ) : (
          <IconActionButton
            label="Ouvrir"
            icon={ExternalLink}
            tone="view"
            href={href}
            target="_blank"
            rel="noreferrer"
          />
        )}
        <IconActionButton
          label="Télécharger"
          icon={Download}
          tone="download"
          href={href}
          download
        />
        <IconActionButton
          label="Modifier"
          icon={Pencil}
          tone="notes"
          onClick={() => onEdit(doc)}
        />
        <IconActionButton
          label="Supprimer"
          icon={Trash2}
          tone="danger"
          onClick={handleDelete}
        />
      </div>
    </div>
  );
}
