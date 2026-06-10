"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Eye,
  MessageSquare,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import IconActionButton from "./IconActionButton";
import ProjectDetailToolbar from "./ProjectDetailToolbar";
import ProjectTabSectionHeader from "./ProjectTabSectionHeader";
import {
  detailChecklistDate,
  detailChecklistEmpty,
  detailChecklistFilterBtn,
  detailChecklistFilterInactive,
  detailChecklistHeader,
  detailChecklistItem,
  detailChecklistItemTitle,
  detailChecklistList,
  detailChecklistNotes,
  detailChecklistRatio,
  detailChecklistRatioTotal,
  detailChecklistSection,
  detailChecklistStatusBadge,
  detailChecklistStatusMissing,
  detailChecklistStatusValidated,
  detailIconActionGroup,
  detailLink,
  detailMediaThumb,
  detailRowTitle,
  detailRowTitleDone,
} from "./project-detail-ui";
import ProjectActivityTab from "./ProjectActivityTab";
import ProjectFinancesPanel from "./ProjectFinancesPanel";
import { FileIcon } from "./FileTypeIcon";
import UserAvatar from "./UserAvatar";
import {
  filterCpsBpuFiles,
  filterProjectFiles,
  formatFileSize,
} from "@/lib/project-detail";
import { resolveMediaUrl } from "@/lib/assets";
import { useDialog } from "@/components/providers/DialogProvider";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
import {
  DEVIS_STATUS_LABELS,
  PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type Project,
  type TaskStatus,
} from "@/types";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import type { ProjectTabId } from "./ProjectDetailTabs";
import type { ProjectQuickAddMode, ProjectUploadKind } from "./project-detail-types";

const TASK_STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
  CANCELLED: "TODO",
};

interface ProjectTabPanelsProps {
  project: Project;
  tab: ProjectTabId;
  onTabChange: (tab: ProjectTabId) => void;
  onQuickAdd: (mode: ProjectQuickAddMode) => void;
  onUpload: (kind: ProjectUploadKind) => void;
}

type TaskFilter = "all" | TaskStatus | "URGENT";
type DeadlineFilter = "all" | "upcoming" | "done";

export default function ProjectTabPanels({
  project,
  tab,
  onTabChange,
  onQuickAdd,
  onUpload,
}: ProjectTabPanelsProps) {
  const { confirm, prompt } = useDialog();
  const mutations = useProjectDetailMutations(project.id);
  const [docSearch, setDocSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("all");

  const legacyDocuments = filterProjectFiles(project.files, "document");
  const documents =
    (project.documents?.length ?? 0) > 0
      ? project.documents!
      : legacyDocuments.map((f) => ({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          size: f.size,
          url: f.url,
          type: "OTHER" as const,
          category: "PROJECT_DOC" as const,
          projectId: f.projectId,
          createdAt: f.createdAt,
          updatedAt: f.createdAt,
        }));
  const legacyPlans = filterProjectFiles(project.files, "plan");
  const legacyRenders = filterProjectFiles(project.files, "render");
  const planRenders = project.planRenders ?? [];
  const plans =
    planRenders.filter((a) => a.kind === "PLAN").length > 0
      ? planRenders.filter((a) => a.kind === "PLAN")
      : legacyPlans.map((f) => ({
          id: f.id,
          name: f.name,
          url: f.url,
          mimeType: f.mimeType,
          size: f.size,
          kind: "PLAN" as const,
          category: "AUTRE",
          fileType: f.fileType,
          createdAt: f.createdAt,
          updatedAt: f.createdAt,
        }));
  const renders =
    planRenders.filter((a) => a.kind === "RENDER").length > 0
      ? planRenders.filter((a) => a.kind === "RENDER")
      : legacyRenders.map((f) => ({
          id: f.id,
          name: f.name,
          url: f.url,
          mimeType: f.mimeType,
          size: f.size,
          kind: "RENDER" as const,
          category: "AUTRE",
          fileType: f.fileType,
          createdAt: f.createdAt,
          updatedAt: f.createdAt,
        }));
  const cpsFiles = filterCpsBpuFiles(project.files ?? []);

  const filteredDocuments = useMemo(() => {
    const q = docSearch.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((f) => f.name.toLowerCase().includes(q));
  }, [documents, docSearch]);

  if (tab === "overview") return null;

  if (tab === "finances") {
    return <ProjectFinancesPanel project={project} />;
  }

  const fileRow = (
    file: { id: string; name: string; url: string; mimeType: string; size: number; createdAt: string },
    onDelete: () => void | Promise<void>,
    onRename?: () => void | Promise<void>
  ) => {
    const href = resolveMediaUrl(file.url) ?? file.url;
    return (
      <li className={detailChecklistItem}>
        <FileIcon mimeType={file.mimeType} name={file.name} />
        <div className="min-w-0 flex-1">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(detailChecklistItemTitle, "hover:text-[#8ba4c7]/90")}
          >
            {file.name}
          </a>
          <p className={detailChecklistDate}>
            {formatFileSize(file.size)} · {formatRelativeTime(file.createdAt)}
          </p>
        </div>
        <div className={detailIconActionGroup}>
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
          {onRename && (
            <IconActionButton
              label="Renommer"
              icon={Pencil}
              tone="notes"
              onClick={() => void onRename()}
            />
          )}
          <IconActionButton
            label="Supprimer"
            icon={Trash2}
            tone="danger"
            onClick={() => void onDelete()}
          />
        </div>
      </li>
    );
  };

  const mediaFileRow = (
    file: {
      id: string;
      name: string;
      url: string;
      mimeType?: string;
      createdAt?: string;
    },
    actions: React.ReactNode
  ) => {
    const src = resolveMediaUrl(file.url);
    const href = src ?? file.url;
    return (
      <li className={detailChecklistItem}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={detailMediaThumb}
        >
          {file.mimeType?.startsWith("image/") && src ? (
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <FileIcon mimeType={file.mimeType} name={file.name} />
            </span>
          )}
        </a>
        <div className="min-w-0 flex-1">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(detailChecklistItemTitle, "hover:text-[#8ba4c7]/90")}
          >
            {file.name}
          </a>
          {file.createdAt && (
            <p className={detailChecklistDate}>
              {formatRelativeTime(file.createdAt)}
            </p>
          )}
        </div>
        <div className={detailIconActionGroup}>{actions}</div>
      </li>
    );
  };

  if (tab === "documents") {
    const docCount = documents.length + cpsFiles.length;

    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Documents"
          count={docCount}
          action={{
            label: "Ajouter un document",
            icon: Upload,
            onClick: () => onUpload("document"),
          }}
          toolbar={
            documents.length > 0 ? (
              <ProjectDetailToolbar
                layout="inline"
                search={{
                  value: docSearch,
                  onChange: setDocSearch,
                  placeholder: "Rechercher…",
                  ariaLabel: "Rechercher un document",
                }}
              />
            ) : undefined
          }
        />

        {documents.length === 0 && cpsFiles.length === 0 ? (
          <p className={detailChecklistEmpty}>
            Aucun document pour ce projet.
          </p>
        ) : filteredDocuments.length === 0 && documents.length > 0 ? (
          <p className={detailChecklistEmpty}>
            Aucun document ne correspond à la recherche.
          </p>
        ) : filteredDocuments.length > 0 ? (
          <ul className={cn(detailChecklistList, "mt-3")}>
            {filteredDocuments.map((f) => {
              const isLibraryDoc = !!project.documents?.some((d) => d.id === f.id);
              return fileRow(
                f,
                async () => {
                  const ok = await confirm({
                    title: "Supprimer",
                    message: `Supprimer « ${f.name} » ?`,
                    variant: "danger",
                    confirmLabel: "Supprimer",
                  });
                  if (!ok) return;
                  if (isLibraryDoc) mutations.deleteDocument.mutate(f.id);
                  else mutations.deleteFile.mutate(f.id);
                },
                async () => {
                  const name = await prompt({
                    title: "Renommer",
                    label: "Nouveau nom",
                    defaultValue: f.name,
                  });
                  if (!name?.trim()) return;
                  if (isLibraryDoc) {
                    mutations.updateDocument.mutate({ id: f.id, name: name.trim() });
                  } else {
                    mutations.updateFile.mutate({ id: f.id, name: name.trim() });
                  }
                }
              );
            })}
          </ul>
        ) : null}

        {cpsFiles.length > 0 && (
          <div className={cn(filteredDocuments.length > 0 && "mt-4")}>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[#9aa3b0]/42">
              CPS / BPU
            </p>
            <ul className={detailChecklistList}>
              {cpsFiles.map((f) =>
                fileRow(
                  f,
                  async () => {
                    const ok = await confirm({
                      title: "Supprimer",
                      message: `Supprimer « ${f.name} » ?`,
                      variant: "danger",
                      confirmLabel: "Supprimer",
                    });
                    if (ok) mutations.deleteFile.mutate(f.id);
                  },
                  async () => {
                    const name = await prompt({
                      title: "Renommer",
                      label: "Nouveau nom",
                      defaultValue: f.name,
                    });
                    if (name?.trim()) mutations.updateFile.mutate({ id: f.id, name: name.trim() });
                  }
                )
              )}
            </ul>
          </div>
        )}

      </section>
    );
  }

  if (tab === "plans") {
    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Plans"
          count={plans.length}
          action={{
            label: "Importer un plan",
            icon: Upload,
            onClick: () => onUpload("plan"),
          }}
        />
        {plans.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucun plan enregistré.</p>
        ) : (
          <ul className={cn(detailChecklistList, "mt-3")}>
            {plans.map((f) =>
              mediaFileRow(
                {
                  id: f.id,
                  name: f.name,
                  url: f.url,
                  mimeType: f.mimeType,
                  createdAt: f.createdAt,
                },
                <>
                  <IconActionButton
                    label="Voir"
                    icon={Eye}
                    tone="view"
                    href={resolveMediaUrl(f.url) ?? f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                  <IconActionButton
                    label="Télécharger"
                    icon={Download}
                    tone="download"
                    href={resolveMediaUrl(f.url) ?? f.url}
                    download
                  />
                  <IconActionButton
                    label="Supprimer"
                    icon={Trash2}
                    tone="danger"
                    onClick={() =>
                      project.planRenders?.some((a) => a.id === f.id)
                        ? mutations.deletePlanRender.mutate(f.id)
                        : mutations.deleteFile.mutate(f.id)
                    }
                  />
                </>
              )
            )}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "renders") {
    const items =
      renders.length > 0
        ? renders
        : project.imageUrl
          ? [
              {
                id: "cover",
                url: project.imageUrl,
                name: project.name,
                mimeType: "image/jpeg",
                createdAt: project.updatedAt,
              },
            ]
          : [];

    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Rendus"
          count={items.length}
          action={{
            label: "Ajouter un rendu",
            icon: Upload,
            onClick: () => onUpload("render"),
          }}
        />
        {items.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucun rendu pour ce projet.</p>
        ) : (
          <ul className={cn(detailChecklistList, "mt-3")}>
            {items.map((f) => {
              const isCover = f.id === "cover";
              return mediaFileRow(
                {
                  id: f.id,
                  name: f.name,
                  url: f.url,
                  mimeType: "mimeType" in f ? f.mimeType : "image/jpeg",
                  createdAt: "createdAt" in f ? f.createdAt : undefined,
                },
                <>
                  <IconActionButton
                    label="Voir"
                    icon={Eye}
                    tone="view"
                    href={resolveMediaUrl(f.url) ?? f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                  {!isCover && (
                    <>
                      <IconActionButton
                        label="Image principale"
                        icon={Star}
                        tone="upload"
                        onClick={() => {
                          if (project.planRenders?.some((a) => a.id === f.id)) {
                            mutations.setPlanRenderMainImage.mutate(f.id);
                          } else {
                            const url = resolveMediaUrl(f.url);
                            if (url) mutations.setProjectCover.mutate(url);
                          }
                        }}
                      />
                      <IconActionButton
                        label="Supprimer"
                        icon={Trash2}
                        tone="danger"
                        onClick={() => {
                          if (project.planRenders?.some((a) => a.id === f.id)) {
                            mutations.deletePlanRender.mutate(f.id);
                          } else {
                            mutations.deleteFile.mutate(f.id);
                          }
                        }}
                      />
                    </>
                  )}
                </>
              );
            })}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "tasks") {
    const allTasks = project.tasks ?? [];
    const tasks = allTasks.filter((t) => {
      if (taskFilter === "all") return true;
      if (taskFilter === "URGENT") return t.priority === "URGENT";
      return t.status === taskFilter;
    });
    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Tâches"
          count={allTasks.length}
          action={{
            label: "Nouvelle tâche",
            icon: Plus,
            onClick: () => onQuickAdd("task"),
          }}
          toolbar={
            allTasks.length > 0 ? (
              <ProjectDetailToolbar
                layout="inline"
                sections={[
                  {
                    label: "Statut",
                    value: taskFilter,
                    onChange: (id) => setTaskFilter(id as TaskFilter),
                    options: [
                      { id: "all", label: "Toutes" },
                      { id: "TODO", label: TASK_STATUS_LABELS.TODO },
                      { id: "IN_PROGRESS", label: TASK_STATUS_LABELS.IN_PROGRESS },
                      { id: "DONE", label: TASK_STATUS_LABELS.DONE },
                      { id: "URGENT", label: "Urgentes" },
                    ],
                  },
                ]}
              />
            ) : undefined
          }
        />
        {allTasks.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucune tâche liée à ce projet.</p>
        ) : tasks.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucune tâche pour ce filtre.</p>
        ) : (
          <ul className={detailChecklistList}>
            {tasks.map((t) => (
              <li key={t.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={
                        t.status === "DONE" ? detailRowTitleDone : detailRowTitle
                      }
                    >
                      {t.title}
                    </p>
                    <span
                      className={cn(
                        detailChecklistStatusBadge,
                        t.priority === "URGENT"
                          ? detailChecklistStatusMissing
                          : t.status === "DONE"
                            ? detailChecklistStatusValidated
                            : "text-[#8ba4c7]/75"
                      )}
                    >
                      {PRIORITY_LABELS[t.priority]}
                    </span>
                  </div>
                  {t.dueDate && (
                    <p className={detailChecklistDate}>
                      Deadline {formatDate(t.dueDate)}
                    </p>
                  )}
                </div>
                <div className={detailIconActionGroup}>
                  <IconActionButton
                    label={
                      t.status === "DONE"
                        ? "Rouvrir la tâche"
                        : t.status === "IN_PROGRESS"
                          ? "Terminer la tâche"
                          : "Démarrer la tâche"
                    }
                    icon={CheckCircle2}
                    tone={t.status === "DONE" ? "notes" : "success"}
                    onClick={() =>
                      mutations.updateTask.mutate({
                        id: t.id,
                        status: TASK_STATUS_CYCLE[t.status],
                      })
                    }
                  />
                  <IconActionButton
                    label="Supprimer"
                    icon={Trash2}
                    tone="danger"
                    onClick={() => mutations.deleteTask.mutate(t.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "planning") {
    const allDeadlines = project.deadlines ?? [];
    const deadlines = allDeadlines
      .filter((d) => {
        if (deadlineFilter === "upcoming") return !d.done;
        if (deadlineFilter === "done") return d.done;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Deadlines"
          count={allDeadlines.length}
          action={{
            label: "Ajouter une deadline",
            icon: Plus,
            onClick: () => onQuickAdd("deadline"),
          }}
          toolbar={
            allDeadlines.length > 0 ? (
              <ProjectDetailToolbar
                layout="inline"
                sections={[
                  {
                    label: "Échéance",
                    value: deadlineFilter,
                    onChange: (id) => setDeadlineFilter(id as DeadlineFilter),
                    options: [
                      { id: "all", label: "Toutes" },
                      { id: "upcoming", label: "À venir" },
                      { id: "done", label: "Terminées" },
                    ],
                  },
                ]}
              />
            ) : undefined
          }
        />
        {allDeadlines.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucune deadline pour ce projet.</p>
        ) : deadlines.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucune deadline pour ce filtre.</p>
        ) : (
          <ul className={detailChecklistList}>
            {deadlines.map((d) => (
              <li key={d.id} className={detailChecklistItem}>
                <input
                  type="checkbox"
                  checked={d.done}
                  onChange={() =>
                    mutations.updateDeadline.mutate({ id: d.id, done: !d.done })
                  }
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#8ba4c7]"
                  aria-label={d.done ? "Marquer non terminée" : "Marquer terminée"}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={d.done ? detailRowTitleDone : detailRowTitle}>
                      {d.title}
                    </p>
                    <span
                      className={cn(
                        detailChecklistStatusBadge,
                        d.done
                          ? detailChecklistStatusValidated
                          : detailChecklistStatusMissing
                      )}
                    >
                      {d.done ? "Terminée" : "À venir"}
                    </span>
                  </div>
                  <p className={detailChecklistDate}>
                    {formatDate(d.date, "d MMMM yyyy")} · {PRIORITY_LABELS[d.priority]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "meetings") {
    const meetings = project.meetings ?? [];
    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Réunions"
          count={meetings.length}
          action={{
            label: "Planifier une réunion",
            icon: Plus,
            onClick: () => onQuickAdd("meeting"),
          }}
        />
        {meetings.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucune réunion planifiée.</p>
        ) : (
          <ul className={cn(detailChecklistList, "mt-3")}>
            {meetings.map((m) => {
              const isPast = new Date(m.date) < new Date();
              return (
                <li key={m.id} className={detailChecklistItem}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={detailRowTitle}>{m.title}</p>
                      <span
                        className={cn(
                          detailChecklistStatusBadge,
                          isPast
                            ? detailChecklistStatusValidated
                            : detailChecklistStatusMissing
                        )}
                      >
                        {isPast ? "Passée" : "À venir"}
                      </span>
                    </div>
                    <p className={detailChecklistDate}>
                      {formatDate(m.date, "d MMMM yyyy")}
                      {m.startTime ? ` · ${m.startTime}` : ""}
                    </p>
                    {m.location && (
                      <p className={detailChecklistNotes}>{m.location}</p>
                    )}
                    {m.notes && (
                      <p className={detailChecklistNotes}>{m.notes}</p>
                    )}
                  </div>
                  <div className={detailIconActionGroup}>
                    <IconActionButton
                      label={m.notes ? "Modifier le compte rendu" : "Ajouter un compte rendu"}
                      icon={MessageSquare}
                      tone="notes"
                      onClick={async () => {
                        const notes = await prompt({
                          title: "Compte rendu",
                          label: "Compte rendu",
                          defaultValue: m.notes ?? "",
                        });
                        if (notes !== null) {
                          mutations.updateMeeting.mutate({ id: m.id, notes: notes.trim() });
                        }
                      }}
                    />
                    <IconActionButton
                      label="Supprimer"
                      icon={Trash2}
                      tone="danger"
                      onClick={async () => {
                        const ok = await confirm({
                          title: "Supprimer la réunion",
                          message: "Supprimer cette réunion ?",
                          variant: "danger",
                          confirmLabel: "Supprimer",
                        });
                        if (ok) mutations.deleteMeeting.mutate(m.id);
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "chantier") {
    const logs = project.chantierLogs ?? [];
    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Chantier"
          count={logs.length}
          action={{
            label: "Ajouter au journal",
            icon: Plus,
            onClick: () => onQuickAdd("chantier"),
          }}
        />
        {logs.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucun journal de chantier.</p>
        ) : (
          <ul className={cn(detailChecklistList, "mt-3")}>
            {logs.map((log) => (
              <li key={log.id} className={cn(detailChecklistItem, "items-start")}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={detailChecklistDate}>
                      {formatDate(log.date, "d MMMM yyyy")}
                    </p>
                    {log.chantierPhase && (
                      <span className="rounded-md border border-app px-1.5 py-0.5 text-[10px] text-glass-secondary">
                        {log.chantierPhase}
                      </span>
                    )}
                    {log.progress != null && (
                      <span className="text-[10px] font-medium tabular-nums text-[#8ba4c7]/75">
                        {log.progress}%
                      </span>
                    )}
                  </div>
                  {log.siteVisit && (
                    <p className={cn(detailRowTitle, "mt-1 leading-snug")}>{log.siteVisit}</p>
                  )}
                  <p className={cn(detailRowTitle, "mt-1 leading-snug text-glass-secondary")}>
                    {log.description}
                  </p>
                  {log.photos && log.photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {log.photos.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block h-14 w-14 overflow-hidden rounded-md border border-app"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                  {log.reportUrl && (
                    <a
                      href={log.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(detailLink, "mt-2 inline-block text-[11px]")}
                    >
                      PV : {log.reportName ?? "Procès-verbal"}
                    </a>
                  )}
                  {log.issues && (
                    <p className="mt-1 text-[11px] text-red-400/65">{log.issues}</p>
                  )}
                  {log.nextSteps && (
                    <p className={detailChecklistNotes}>{log.nextSteps}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "activity") {
    return <ProjectActivityTab project={project} />;
  }

  return null;
}
