"use client";

import { Download, Eye, Pencil } from "lucide-react";
import { FileIcon } from "@/components/projects/detail/FileTypeIcon";
import Badge from "@/components/ui/Badge";
import { documentsGridCard, documentsGridThumb } from "./documents-list-ui";
import {
  canPreviewDocument,
  formatDocumentSize,
} from "@/lib/documents-list";
import { resolveMediaUrl } from "@/lib/assets";
import type { Document } from "@/types";
import { DOCUMENT_TYPE_LABELS } from "@/types";
import { cn, formatDate } from "@/lib/utils";

interface DocumentGridViewProps {
  documents: Document[];
  onEdit: (doc: Document) => void;
  onPreview: (doc: Document) => void;
}

export default function DocumentGridView({
  documents,
  onEdit,
  onPreview,
}: DocumentGridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} onEdit={onEdit} onPreview={onPreview} />
      ))}
    </div>
  );
}

function DocumentCard({
  doc,
  onEdit,
  onPreview,
}: {
  doc: Document;
  onEdit: (doc: Document) => void;
  onPreview: (doc: Document) => void;
}) {
  const href = resolveMediaUrl(doc.url) ?? doc.url;
  const previewable = canPreviewDocument(doc);
  const isImage = doc.mimeType.startsWith("image/");

  return (
    <div className={documentsGridCard}>
      <div className={documentsGridThumb}>
        {isImage && href ? (
          <img src={href} alt="" className="h-full w-full object-cover" />
        ) : (
          <FileIcon mimeType={doc.mimeType} name={doc.name} className="h-12 w-12" />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition group-hover:opacity-100">
          {previewable && (
            <button
              type="button"
              onClick={() => onPreview(doc)}
              className="rounded-lg bg-white/90 p-2 text-stone-800"
              aria-label="Aperçu"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <a
            href={href}
            download
            className="rounded-lg bg-white/90 p-2 text-stone-800"
            aria-label="Télécharger"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => onEdit(doc)}
            className="rounded-lg bg-white/90 p-2 text-stone-800"
            aria-label="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="line-clamp-2 text-[13px] font-medium text-glass">{doc.name}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <Badge variant="studio">{DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}</Badge>
        <span className="text-[10px] text-glass-muted">{formatDocumentSize(doc.size)}</span>
      </div>
      {(doc.projectName || doc.clientName) && (
        <p className="mt-1 line-clamp-1 text-[11px] text-glass-muted">
          {doc.projectName ?? doc.clientName}
        </p>
      )}
      <p className="mt-1 text-[10px] text-glass-muted">
        {formatDate(doc.uploadedAt ?? doc.createdAt)}
      </p>
    </div>
  );
}
