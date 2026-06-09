"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { FileIcon } from "@/components/projects/detail/FileTypeIcon";
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
import { usePortalRowMenu, portalMenuStyle } from "@/hooks/usePortalRowMenu";
import { glassBtnIcon, glassMenu } from "@/lib/glass-styles";
import { cn, formatDate } from "@/lib/utils";

const MENU_WIDTH = 192;

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
      <span />
    </div>
  );
}

export default function DocumentRow({ doc, onEdit, onPreview }: DocumentRowProps) {
  const { ref, menuRef, menuOpen, menuPos, closeMenu, toggleMenu } = usePortalRowMenu(
    MENU_WIDTH,
    220
  );
  const deleteDoc = useDeleteDocument();
  const href = resolveMediaUrl(doc.url) ?? doc.url;
  const previewable = canPreviewDocument(doc);

  const handleDelete = () => {
    if (!window.confirm(`Supprimer « ${doc.name} » ?`)) return;
    deleteDoc.mutate(doc.id);
    closeMenu();
  };

  const menuPanel =
    menuOpen && menuPos ? (
      <div
        ref={menuRef}
        role="menu"
        className={cn(glassMenu, "fixed z-[200] w-48 py-1")}
        style={portalMenuStyle(menuPos)}
      >
        {previewable ? (
          <MenuBtn onClick={() => { onPreview(doc); closeMenu(); }}>
            <Eye className="h-4 w-4" /> Aperçu
          </MenuBtn>
        ) : (
          <MenuBtn onClick={() => { window.open(href, "_blank"); closeMenu(); }}>
            <ExternalLink className="h-4 w-4" /> Ouvrir
          </MenuBtn>
        )}
        <a
          href={href}
          download
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/55 hover:bg-white/[0.06] hover:text-studio-light"
          onClick={closeMenu}
        >
          <Download className="h-4 w-4" /> Télécharger
        </a>
        <MenuBtn onClick={() => { onEdit(doc); closeMenu(); }}>
          <Pencil className="h-4 w-4" /> Modifier
        </MenuBtn>
        {doc.projectId && (
          <Link
            href={`/projects/${doc.projectId}?tab=documents`}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/55 hover:bg-white/[0.06] hover:text-studio-light"
            onClick={closeMenu}
          >
            <ExternalLink className="h-4 w-4" /> Ouvrir projet
          </Link>
        )}
        <MenuBtn danger onClick={handleDelete}>
          <Trash2 className="h-4 w-4" /> Supprimer
        </MenuBtn>
      </div>
    ) : null;

  return (
    <div className={documentsListRow}>
      <div className="flex min-w-0 items-center gap-3">
        <FileIcon mimeType={doc.mimeType} name={doc.name} className="h-8 w-8 shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-medium text-[#e8edf4]/88">{doc.name}</p>
          {doc.description && (
            <p className="line-clamp-1 text-[11px] text-[#9aa3b0]/50">{doc.description}</p>
          )}
        </div>
      </div>

      <span>
        <Badge variant="studio">{DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}</Badge>
      </span>

      <span className="text-[#9aa3b0]/65">
        {DOCUMENT_CATEGORY_LABELS[doc.category] ?? doc.category}
      </span>

      <span className="text-[#9aa3b0]/65">
        {doc.projectId && doc.projectName ? (
          <Link href={`/projects/${doc.projectId}?tab=documents`} className={documentsListLink}>
            {doc.projectName}
          </Link>
        ) : (
          "—"
        )}
      </span>

      <span className="text-[#9aa3b0]/65">
        {doc.clientId && doc.clientName ? (
          <Link href={`/clients/${doc.clientId}?tab=documents`} className={documentsListLink}>
            {doc.clientName}
          </Link>
        ) : (
          "—"
        )}
      </span>

      <span className="text-[#9aa3b0]/65">{formatDocumentSize(doc.size)}</span>

      <span className="text-[#9aa3b0]/65">{formatDate(doc.uploadedAt ?? doc.createdAt)}</span>

      <div ref={ref} className="relative justify-self-end">
        <button
          type="button"
          onClick={toggleMenu}
          className={cn(
            glassBtnIcon,
            "h-8 w-8 border-0",
            menuOpen && "bg-studio-soft text-studio-light"
          )}
          aria-label="Actions document"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {typeof document !== "undefined" &&
          menuPanel &&
          createPortal(menuPanel, document.body)}
      </div>
    </div>
  );
}

function MenuBtn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm",
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-white/55 hover:bg-white/[0.06] hover:text-studio-light"
      )}
    >
      {children}
    </button>
  );
}
