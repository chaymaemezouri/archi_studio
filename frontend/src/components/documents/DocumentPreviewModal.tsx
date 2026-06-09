"use client";

import { Download } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { canPreviewDocument } from "@/lib/documents-list";
import { resolveMediaUrl } from "@/lib/assets";
import type { Document } from "@/types";
import { documentsShell } from "./documents-list-ui";
import { glassBtnPrimary } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface DocumentPreviewModalProps {
  doc: Document | null;
  onClose: () => void;
}

export default function DocumentPreviewModal({ doc, onClose }: DocumentPreviewModalProps) {
  if (!doc) return null;

  const href = resolveMediaUrl(doc.url) ?? doc.url;
  const previewable = canPreviewDocument(doc);
  const isPdf = doc.mimeType.includes("pdf") || doc.type === "PDF";
  const isImage = doc.mimeType.startsWith("image/");

  return (
    <Modal isOpen={!!doc} onClose={onClose} title={doc.name} size="xl">
      <div className="space-y-4">
        {previewable ? (
          <div className={cn(documentsShell, "max-h-[70vh] overflow-auto p-1")}>
            {isImage && href && (
              <img src={href} alt={doc.name} className="mx-auto max-h-[65vh] object-contain" />
            )}
            {isPdf && href && (
              <iframe src={href} title={doc.name} className="h-[65vh] w-full" />
            )}
          </div>
        ) : (
          <div className={cn(documentsShell, "px-6 py-12 text-center")}>
            <p className="text-sm text-[#9aa3b0]/60">
              Aperçu non disponible pour ce type de fichier.
            </p>
            <a
              href={href}
              download
              className={cn(glassBtnPrimary, "mt-4 inline-flex items-center gap-2")}
            >
              <Download className="h-4 w-4" />
              Télécharger
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}
