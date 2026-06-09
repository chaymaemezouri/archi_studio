"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  FileUp,
  MessageSquare,
  Trash2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import IconActionButton from "./IconActionButton";
import ProjectDetailToolbar from "./ProjectDetailToolbar";
import {
  detailChecklistDate,
  detailChecklistDateMissing,
  detailChecklistDateUploaded,
  detailChecklistDateValidated,
  detailChecklistEmpty,
  detailChecklistFooterNote,
  detailChecklistHeader,
  detailSectionHeaderLead,
  detailChecklistItem,
  detailChecklistItemTitle,
  detailChecklistList,
  detailChecklistNotes,
  detailChecklistRatio,
  detailChecklistRatioAdded,
  detailChecklistRatioSep,
  detailChecklistRatioTotal,
  detailChecklistSection,
  detailChecklistStatusBadge,
  detailChecklistStatusMissing,
  detailChecklistStatusUploaded,
  detailChecklistStatusValidated,
  detailChecklistTitle,
  detailIconActionGroup,
} from "./project-detail-ui";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
import { uploadDocumentFile } from "@/lib/document-upload";
import { resolveMediaUrl } from "@/lib/assets";
import { getChecklistStats } from "@/lib/project-detail";
import {
  CHECKLIST_STATUS_LABELS,
  type ChecklistItemStatus,
  type Project,
  type ProjectChecklistItem,
} from "@/types";
import { cn, formatDate } from "@/lib/utils";

interface ProjectChecklistTabProps {
  project: Project;
}

const STATUS_BADGE: Record<ChecklistItemStatus, string> = {
  MISSING: detailChecklistStatusMissing,
  UPLOADED: detailChecklistStatusUploaded,
  VALIDATED: detailChecklistStatusValidated,
};

const STATUS_DATE: Record<ChecklistItemStatus, string> = {
  MISSING: detailChecklistDateMissing,
  UPLOADED: detailChecklistDateUploaded,
  VALIDATED: detailChecklistDateValidated,
};

export default function ProjectChecklistTab({ project }: ProjectChecklistTabProps) {
  const items = project.checklistItems ?? [];
  const stats = getChecklistStats(project);
  const mutations = useProjectDetailMutations(project.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [filter, setFilter] = useState<ChecklistItemStatus | "all">("all");

  const filtered = items.filter((item) => filter === "all" || item.status === filter);

  const handleUpload = async (item: ProjectChecklistItem, file: File) => {
    try {
      const doc = await uploadDocumentFile(file, {
        name: item.title,
        category: "ADMIN",
        projectId: project.id,
      });
      await mutations.updateChecklistItem.mutateAsync({
        id: item.id,
        status: "UPLOADED",
        fileUrl: doc.url,
        documentId: doc.id,
      });
      toast.success("Document ajouté");
    } catch {
      toast.error("Échec de l'upload");
    }
  };

  const handleDelete = async (item: ProjectChecklistItem) => {
    if (!window.confirm(`Supprimer le fichier « ${item.title} » ?`)) return;
    await mutations.updateChecklistItem.mutateAsync({
      id: item.id,
      status: "MISSING",
      fileUrl: null,
      documentId: null,
    });
    toast.success("Fichier supprimé");
  };

  const handleValidate = async (item: ProjectChecklistItem) => {
    if (!item.fileUrl) {
      toast.error("Ajoutez un fichier avant de valider");
      return;
    }
    await mutations.updateChecklistItem.mutateAsync({
      id: item.id,
      status: "VALIDATED",
    });
    toast.success("Document validé");
  };

  return (
    <section className={detailChecklistSection}>
      <div className={detailChecklistHeader}>
        <div className={detailSectionHeaderLead}>
          <h2 className={cn(detailChecklistTitle, "shrink-0")}>
            Checklist administrative
          </h2>
          {items.length > 0 && (
            <ProjectDetailToolbar
              layout="inline"
              sections={[
                {
                  label: "Statut",
                  value: filter,
                  onChange: (id) => setFilter(id as ChecklistItemStatus | "all"),
                  options: [
                    { id: "all", label: "Tous" },
                    { id: "MISSING", label: "Manquants" },
                    { id: "UPLOADED", label: "Ajoutés" },
                    { id: "VALIDATED", label: "Validés" },
                  ],
                },
              ]}
            />
          )}
        </div>
        {stats.total > 0 && (
          <p className={detailChecklistRatio}>
            <span className={detailChecklistRatioAdded}>{stats.added}</span>
            <span className={detailChecklistRatioSep}>/</span>
            <span className={detailChecklistRatioTotal}>{stats.total}</span>
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          const itemId = uploadTarget;
          e.target.value = "";
          setUploadTarget(null);
          if (!file || !itemId) return;
          const item = items.find((i) => i.id === itemId);
          if (item) await handleUpload(item, file);
        }}
      />

      {items.length === 0 ? (
        <p className={detailChecklistEmpty}>
          La checklist sera créée automatiquement au prochain chargement.
        </p>
      ) : filtered.length === 0 ? (
        <p className={detailChecklistEmpty}>Aucun élément pour ce filtre.</p>
      ) : (
        <ul className={detailChecklistList}>
          {filtered.map((item) => {
            const href = item.fileUrl ? resolveMediaUrl(item.fileUrl) ?? item.fileUrl : null;
            return (
              <li key={item.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={detailChecklistItemTitle}>{item.title}</p>
                    <span
                      className={cn(
                        detailChecklistStatusBadge,
                        STATUS_BADGE[item.status]
                      )}
                    >
                      {CHECKLIST_STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  {item.uploadedAt && (
                    <p
                      className={cn(
                        detailChecklistDate,
                        STATUS_DATE[item.status]
                      )}
                    >
                      Ajouté le {formatDate(item.uploadedAt, "d MMM yyyy")}
                    </p>
                  )}
                  {item.notes && (
                    <p className={detailChecklistNotes}>{item.notes}</p>
                  )}
                </div>

                <div className={detailIconActionGroup}>
                  {!href ? (
                    <IconActionButton
                      label="Ajouter un fichier"
                      icon={Upload}
                      tone="upload"
                      onClick={() => {
                        setUploadTarget(item.id);
                        fileInputRef.current?.click();
                      }}
                      disabled={mutations.updateChecklistItem.isPending}
                    />
                  ) : (
                    <>
                      <IconActionButton
                        label="Voir"
                        icon={Eye}
                        tone="view"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                      <IconActionButton
                        label="Télécharger"
                        icon={Download}
                        tone="download"
                        href={href}
                        download
                      />
                      {item.status !== "VALIDATED" && (
                        <IconActionButton
                          label="Valider"
                          icon={CheckCircle2}
                          tone="success"
                          onClick={() => handleValidate(item)}
                          disabled={mutations.updateChecklistItem.isPending}
                        />
                      )}
                      <IconActionButton
                        label="Supprimer"
                        icon={Trash2}
                        tone="danger"
                        onClick={() => handleDelete(item)}
                        disabled={mutations.updateChecklistItem.isPending}
                      />
                    </>
                  )}
                  <IconActionButton
                    label="Notes"
                    icon={MessageSquare}
                    tone="notes"
                    onClick={() => {
                      const notes = window.prompt("Notes (optionnel) :", item.notes ?? "");
                      if (notes === null) return;
                      mutations.updateChecklistItem.mutate({ id: item.id, notes: notes.trim() });
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className={detailChecklistFooterNote}>
        <FileUp className="h-3 w-3 shrink-0 text-[#8ba4c7]/35" aria-hidden />
        Les fichiers uploadés sont aussi enregistrés dans Documents (catégorie Administratif).
      </p>
    </section>
  );
}
