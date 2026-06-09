"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Pencil,
  Pin,
  PinOff,
  Plus,
  StickyNote,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import IconActionButton from "./IconActionButton";
import ProjectDetailToolbar from "./ProjectDetailToolbar";
import {
  detailChecklistEmpty,
  detailChecklistList,
  detailChecklistRatio,
  detailChecklistRatioTotal,
  detailIconActionGroup,
  detailNotesBodyInput,
  detailNotesComposer,
  detailNotesHeader,
  detailSectionHeaderLead,
  detailNotesItem,
  detailNotesItemMeta,
  detailNotesItemPreview,
  detailNotesItemTitle,
  detailNotesPinnedLabel,
  detailNotesSection,
  detailNotesTitle,
  detailNotesTitleInput,
} from "./project-detail-ui";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
import type { Project, ProjectNote } from "@/types";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";

interface ProjectNotesTabProps {
  project: Project;
}

type NotesFilter = "all" | "pinned";

function noteTitle(note: ProjectNote) {
  if (note.title?.trim()) return note.title.trim();
  const line = note.content.trim().split("\n")[0]?.trim();
  if (!line) return "Sans titre";
  return line.length > 48 ? `${line.slice(0, 48)}…` : line;
}

export default function ProjectNotesTab({ project }: ProjectNotesTabProps) {
  const { createProjectNote, updateProjectNote, deleteProjectNote } =
    useProjectDetailMutations(project.id);

  const allNotes = useMemo(() => {
    const list = [...(project.projectNotes ?? [])];
    if (project.notes?.trim() && list.length === 0) {
      list.push({
        id: "__legacy",
        projectId: project.id,
        title: "Note existante",
        content: project.notes.trim(),
        pinned: false,
        createdAt: project.updatedAt,
        updatedAt: project.updatedAt,
      });
    }
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [project.projectNotes, project.notes, project.id, project.updatedAt]);

  const [filter, setFilter] = useState<NotesFilter>("all");
  const [search, setSearch] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allNotes.filter((n) => {
      if (filter === "pinned" && !n.pinned) return false;
      if (!q) return true;
      const hay = `${n.title ?? ""} ${n.content}`.toLowerCase();
      return hay.includes(q);
    });
  }, [allNotes, filter, search]);

  const resetComposer = () => {
    setDraftTitle("");
    setDraftContent("");
  };

  const handleAdd = () => {
    const content = draftContent.trim();
    if (!content) {
      toast.error("Écrivez le contenu de la note");
      return;
    }
    createProjectNote.mutate(
      {
        content,
        title: draftTitle.trim() || undefined,
      },
      { onSuccess: resetComposer }
    );
  };

  const startEdit = (note: ProjectNote) => {
    setEditingId(note.id);
    setEditTitle(note.title ?? "");
    setEditContent(note.content);
  };

  const saveEdit = (noteId: string) => {
    const content = editContent.trim();
    if (!content) {
      toast.error("Le contenu ne peut pas être vide");
      return;
    }
    updateProjectNote.mutate(
      {
        noteId,
        content,
        title: editTitle.trim() || null,
      },
      { onSuccess: () => setEditingId(null) }
    );
  };

  const togglePin = (note: ProjectNote) => {
    if (note.id === "__legacy") return;
    updateProjectNote.mutate({ noteId: note.id, pinned: !note.pinned });
  };

  const copyNote = async (note: ProjectNote) => {
    try {
      await navigator.clipboard.writeText(note.content);
      toast.success("Copié dans le presse-papiers");
    } catch {
      toast.error("Copie impossible");
    }
  };

  return (
    <section className={detailNotesSection}>
      <div className={detailNotesHeader}>
        <h2 className={detailNotesTitle}>Notes du projet</h2>
        {allNotes.length > 0 && (
          <p className={detailChecklistRatio}>
            <span className={detailChecklistRatioTotal}>{allNotes.length}</span>
          </p>
        )}
      </div>

      <div className={detailNotesComposer}>
        <input
          type="text"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Titre (optionnel)"
          className={detailNotesTitleInput}
          aria-label="Titre de la note"
        />
        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          className={detailNotesBodyInput}
          aria-label="Contenu de la note"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              if (!createProjectNote.isPending) handleAdd();
            }
          }}
        />
        <div className="flex justify-end">
          <IconActionButton
            label="Ajouter la note"
            icon={Plus}
            tone="upload"
            onClick={handleAdd}
            disabled={createProjectNote.isPending || !draftContent.trim()}
          />
        </div>
      </div>

      {allNotes.length > 0 && (
        <ProjectDetailToolbar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: "Rechercher dans les notes…",
            ariaLabel: "Rechercher dans les notes",
          }}
        />
      )}

      {filtered.length === 0 ? (
        <p className={detailChecklistEmpty}>
          {allNotes.length === 0
            ? "Aucune note pour ce projet. Ajoutez-en une ci-dessus."
            : "Aucune note ne correspond à ce filtre."}
        </p>
      ) : (
        <ul className={cn(detailChecklistList, "mt-3")}>
          {filtered.map((note) => {
            const isLegacy = note.id === "__legacy";
            const isEditing = editingId === note.id;

            return (
              <li key={note.id} className={detailNotesItem}>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Titre (optionnel)"
                        className={detailNotesTitleInput}
                        aria-label="Titre"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={cn(detailNotesBodyInput, "min-h-[120px]")}
                        aria-label="Contenu"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(note.id)}
                          disabled={updateProjectNote.isPending}
                          className="text-[11px] font-medium text-[#8ba4c7]/90 hover:text-[#b8d4f0]"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-[11px] text-[#9aa3b0]/50 hover:text-glass-secondary/70"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <StickyNote
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            note.pinned ? "text-amber-400/80" : "text-glass-muted"
                          )}
                          aria-hidden
                        />
                        <p className={detailNotesItemTitle}>{noteTitle(note)}</p>
                        {note.pinned && (
                          <span className={detailNotesPinnedLabel}>Épinglée</span>
                        )}
                      </div>
                      <p className={detailNotesItemPreview}>{note.content}</p>
                      <p className={detailNotesItemMeta}>
                        {formatDate(note.updatedAt, "d MMM yyyy")}
                        {" · "}
                        {formatRelativeTime(note.updatedAt)}
                      </p>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className={detailIconActionGroup}>
                    {!isLegacy && (
                      <IconActionButton
                        label={note.pinned ? "Retirer l'épingle" : "Épingler"}
                        icon={note.pinned ? PinOff : Pin}
                        tone={note.pinned ? "notes" : "upload"}
                        onClick={() => togglePin(note)}
                        disabled={updateProjectNote.isPending}
                      />
                    )}
                    <IconActionButton
                      label="Copier"
                      icon={Copy}
                      tone="view"
                      onClick={() => copyNote(note)}
                    />
                    {!isLegacy && (
                      <>
                        <IconActionButton
                          label="Modifier"
                          icon={Pencil}
                          tone="notes"
                          onClick={() => startEdit(note)}
                        />
                        <IconActionButton
                          label="Supprimer"
                          icon={Trash2}
                          tone="danger"
                          onClick={() => {
                            if (window.confirm("Supprimer cette note ?")) {
                              deleteProjectNote.mutate(note.id);
                            }
                          }}
                          disabled={deleteProjectNote.isPending}
                        />
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
