"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckSquare,
  CreditCard,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Gavel,
  Image as ImageIcon,
  Mail,
  Paperclip,
  Pencil,
  PenTool,
  Phone,
  Receipt,
  Send,
  Share2,
  StickyNote,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useDialog } from "@/components/providers/DialogProvider";
import ShareNotePicker from "@/components/dashboard/ShareNotePicker";
import {
  useCreateSharedNote,
  useDeleteSharedNote,
  useSharedNotes,
  useUpdateSharedNote,
  type SharedNoteDraft,
  type SharedNoteRefDraft,
} from "@/hooks/useSharedNotes";
import { useAuth } from "@/hooks/useAuth";
import { resolveMediaUrl } from "@/lib/assets";
import type { SharedNote, SharedNoteFile, SharedNoteRef, SharedNoteRefKind } from "@/types";
import { cn } from "@/lib/utils";
import { accentBar, glassInput } from "@/lib/glass-styles";
import {
  dashboardPanel,
  dashboardPanelHeader,
  dashboardPanelTitle,
} from "./dashboard-ui";

const emptyDraft = (): SharedNoteDraft => ({
  content: "",
  refs: [],
  files: [],
});

function draftFromNote(note: SharedNote): SharedNoteDraft {
  return {
    content: note.content ?? "",
    contactName: note.contactName ?? "",
    contactPhone: note.contactPhone ?? "",
    contactEmail: note.contactEmail ?? "",
    files: [],
    removeFileIds: [],
  };
}

function hasDraft(draft: SharedNoteDraft, keptFiles = 0) {
  return (
    Boolean(draft.content.trim()) ||
    (draft.refs?.length ?? 0) > 0 ||
    Boolean(draft.contactName?.trim()) ||
    Boolean(draft.contactPhone?.trim()) ||
    Boolean(draft.contactEmail?.trim()) ||
    (draft.files?.length ?? 0) > 0 ||
    keptFiles > 0
  );
}

function formatSize(size: number) {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

const REF_ICON: Record<SharedNoteRefKind, typeof UserRound> = {
  CLIENT: UserRound,
  PROJECT: FolderKanban,
  DOCUMENT: FileText,
  PLAN: PenTool,
  RENDER: ImageIcon,
  DEVIS: FileSpreadsheet,
  INVOICE: Receipt,
  PAYMENT: CreditCard,
  TASK: CheckSquare,
  TENDER: Gavel,
};

const REF_LABEL: Record<SharedNoteRefKind, string> = {
  CLIENT: "Contact",
  PROJECT: "Projet",
  DOCUMENT: "Document",
  PLAN: "Plan",
  RENDER: "Image",
  DEVIS: "Devis",
  INVOICE: "Facture",
  PAYMENT: "Paiement",
  TASK: "Tâche",
  TENDER: "Appel d'offres",
};

function RefChip({
  item,
}: {
  item: Pick<SharedNoteRef, "kind" | "title" | "subtitle" | "href" | "url">;
}) {
  const Icon = REF_ICON[item.kind] ?? StickyNote;
  const fileUrl = item.url ? resolveMediaUrl(item.url) : null;
  const className =
    "inline-flex max-w-full items-center gap-1.5 rounded-full border border-glass bg-[color:var(--glass-bg-hover)] px-2.5 py-1 text-[12px] text-glass transition hover:border-[color:var(--glass-border-hover)]";
  const inner = (
    <>
      <Icon className="h-3.5 w-3.5 shrink-0 text-studio-light" />
      <span className="truncate">{item.title}</span>
      {item.subtitle && (
        <span className="truncate text-glass-muted">{item.subtitle}</span>
      )}
    </>
  );
  if (fileUrl) {
    return (
      <a href={fileUrl} target="_blank" rel="noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className}>
      {inner}
    </Link>
  );
}

const shareCardShell =
  "block w-full max-w-[19rem] overflow-hidden rounded-2xl border border-app bg-[color:var(--background)] shadow-sm transition hover:border-studio-border/40 hover:shadow-md";

function initials(name?: string | null) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function contactFromRefSubtitle(subtitle?: string | null) {
  const parts = (subtitle ?? "")
    .split("·")
    .map((p) => p.trim())
    .filter(Boolean);
  let phone: string | undefined;
  let email: string | undefined;
  for (const part of parts) {
    if (part.includes("@")) email = part;
    else if (/\d/.test(part)) phone = part;
  }
  return { phone, email };
}

function ShareEntityCard({
  item,
}: {
  item: Pick<SharedNoteRef, "kind" | "title" | "subtitle" | "href" | "url">;
}) {
  const Icon = REF_ICON[item.kind] ?? StickyNote;
  const fileUrl = item.url ? resolveMediaUrl(item.url) : null;
  const href = fileUrl ?? item.href;
  const external = Boolean(fileUrl);
  const body = (
    <div className="flex items-center gap-3 px-3 py-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-studio-light/12 text-studio-light">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-glass-muted">
          {REF_LABEL[item.kind] ?? "Partage"}
        </p>
        <p className="mt-0.5 truncate text-[13px] font-semibold text-app-primary">
          {item.title}
        </p>
        {item.subtitle && (
          <p className="mt-0.5 truncate text-[11px] text-glass-muted">
            {item.subtitle}
          </p>
        )}
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-glass-muted" />
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={shareCardShell}>
        {body}
      </a>
    );
  }
  return (
    <Link href={href} className={shareCardShell}>
      {body}
    </Link>
  );
}

function ContactShareCard({
  name,
  phone,
  email,
  href,
}: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  href?: string | null;
}) {
  const content = (
    <>
      <div className="flex items-center gap-3 px-3 pt-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-studio-light/15 text-[13px] font-semibold text-studio-light">
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-glass-muted">
            Contact
          </p>
          <p className="mt-0.5 truncate text-[14px] font-semibold text-app-primary">
            {name || "Sans nom"}
          </p>
        </div>
        {href && <ExternalLink className="h-4 w-4 shrink-0 text-glass-muted" />}
      </div>
      {(phone || email) && (
        <div className="mt-3 space-y-0 border-t border-app px-1 py-1">
          {phone && (
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12px] text-glass-secondary transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{phone}</span>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12px] text-glass-secondary transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{email}</span>
            </a>
          )}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(shareCardShell, "max-w-[19rem] pb-1")}>
        {content}
      </Link>
    );
  }
  return <div className={cn(shareCardShell, "max-w-[19rem] pb-1")}>{content}</div>;
}

function FileShareCard({ file }: { file: SharedNoteFile }) {
  const isImage = file.mimeType?.startsWith("image/");
  const url = resolveMediaUrl(file.url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={cn(shareCardShell, "max-w-[19rem]")}
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="h-40 w-full object-cover" />
      ) : null}
      <div className="flex items-center gap-3 px-3 py-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-studio-light/12 text-studio-light">
          <Paperclip className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-glass-muted">
            Fichier
          </p>
          <p className="mt-0.5 truncate text-[13px] font-semibold text-app-primary">
            {file.name}
          </p>
          <p className="mt-0.5 text-[11px] text-glass-muted">
            {formatSize(file.size)}
          </p>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-glass-muted" />
      </div>
    </a>
  );
}

export default function DashboardSharedNotes({
  className,
  variant = "page",
}: {
  className?: string;
  /** `page` = pleine hauteur ; `panel` = carte compacte */
  variant?: "page" | "panel";
}) {
  const { user } = useAuth();
  const { data: notes = [], isLoading } = useSharedNotes();
  const createNote = useCreateSharedNote();
  const updateNote = useUpdateSharedNote();
  const deleteNote = useDeleteSharedNote();
  const { confirm } = useDialog();
  const [draft, setDraft] = useState<SharedNoteDraft>(emptyDraft);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<SharedNoteDraft>(emptyDraft);
  const scroller = useRef<HTMLDivElement>(null);
  const thread = [...notes].reverse();

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [notes.length]);

  const addRef = (item: SharedNoteRefDraft) => {
    setDraft((current) => {
      const refs = current.refs ?? [];
      if (refs.some((ref) => ref.kind === item.kind && ref.entityId === item.entityId))
        return current;
      return { ...current, refs: [...refs, item].slice(0, 8) };
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasDraft(draft)) return;
    await createNote.mutateAsync(draft);
    setDraft(emptyDraft());
    setPickerOpen(false);
  };

  const startEdit = (note: SharedNote) => {
    setPickerOpen(false);
    setEditingId(note.id);
    setEditDraft(draftFromNote(note));
  };

  const handleSave = async (note: SharedNote) => {
    const kept =
      (note.files ?? []).filter((file) => !editDraft.removeFileIds?.includes(file.id))
        .length + (editDraft.files?.length ?? 0);
    if (!hasDraft(editDraft, kept)) return;
    await updateNote.mutateAsync({ id: note.id, ...editDraft });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Supprimer ce message ?",
      message: "Il disparaîtra pour les deux cabinets.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (ok) deleteNote.mutate(id);
  };

  return (
    <section
      className={cn(
        dashboardPanel,
        "flex flex-col overflow-hidden",
        variant === "page"
          ? "min-h-[min(70vh,40rem)] h-[calc(100dvh-8.5rem)] max-h-[calc(100dvh-8.5rem)]"
          : "max-h-[34rem]",
        className
      )}
    >
      <div className={dashboardPanelHeader}>
        <h2 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Discussion partagée
          {notes.length > 0 && (
            <span className="rounded-full bg-[color:var(--glass-bg-hover)] px-1.5 py-0.5 text-[10px] font-medium text-glass-muted">
              {notes.length}
            </span>
          )}
        </h2>
      </div>

      <div
        ref={scroller}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3"
      >
        {isLoading ? (
          <p className="py-8 text-center text-[12px] text-glass-muted">
            Chargement…
          </p>
        ) : thread.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-glass bg-[color:var(--glass-bg-hover)] text-glass-muted">
              <StickyNote className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <p className="max-w-[18rem] text-[12px] leading-relaxed text-glass-muted">
              Écrivez ici, ou partagez un contact, un projet, un document, un plan
              ou une image.
            </p>
          </div>
        ) : (
          thread.map((note) => {
            const editing = editingId === note.id;
            const mine = Boolean(
              user?.id && (note.authorId === user.id || note.author?.id === user.id)
            );
            const hasContact = Boolean(
              note.contactName || note.contactPhone || note.contactEmail
            );

            const hasText = Boolean(note.content.trim()) || editing;
            const hasShares =
              hasContact ||
              (note.refs?.length ?? 0) > 0 ||
              (note.files?.length ?? 0) > 0;

            return (
              <div
                key={note.id}
                className={cn(
                  "group flex w-full flex-col gap-1.5",
                  mine ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "flex max-w-[min(90%,22rem)] items-center gap-2",
                    mine ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <p className="text-[10px] tracking-wide text-glass-muted">
                    <span className="font-medium text-glass-secondary">
                      {mine ? "Vous" : note.author?.name ?? "Cabinet"}
                    </span>
                    {" · "}
                    {format(new Date(note.createdAt), "d MMM · HH:mm", {
                      locale: fr,
                    })}
                  </p>
                  {!editing && mine && (
                    <div className="flex opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => startEdit(note)}
                        className="rounded-md p-1 text-glass-muted hover:text-glass"
                        aria-label="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        className="rounded-md p-1 text-glass-muted hover:text-rose-400"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {hasText && (
                  <div
                    className={cn(
                      "max-w-[min(85%,22rem)] rounded-2xl px-3 py-2.5 shadow-sm",
                      mine
                        ? "rounded-br-md bg-studio-light text-white dark:text-[#0a0a0f]"
                        : "rounded-bl-md border border-glass bg-[color:var(--glass-bg)]/80"
                    )}
                  >
                    {editing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editDraft.content}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              content: e.target.value,
                            })
                          }
                          rows={2}
                          className={cn(
                            glassInput,
                            "min-h-[64px] w-full resize-y px-3 text-[13px]"
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg px-2.5 py-1.5 text-[12px] text-white/80"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            disabled={updateNote.isPending}
                            onClick={() => handleSave(note)}
                            className="rounded-lg bg-white px-3 py-1.5 text-[12px] font-medium text-studio-light disabled:opacity-40"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={cn(
                          "whitespace-pre-wrap text-[13px] leading-relaxed",
                          mine
                            ? "text-white dark:text-[#0a0a0f]"
                            : "text-glass"
                        )}
                      >
                        {note.content}
                      </p>
                    )}
                  </div>
                )}

                {hasShares && !editing && (
                  <div className="flex w-full max-w-[min(90%,22rem)] flex-col gap-2">
                    {hasContact && (
                      <ContactShareCard
                        name={note.contactName}
                        phone={note.contactPhone}
                        email={note.contactEmail}
                      />
                    )}
                    {(note.refs ?? []).map((ref) => {
                      if (ref.kind === "CLIENT") {
                        const { phone, email } = contactFromRefSubtitle(
                          ref.subtitle
                        );
                        return (
                          <ContactShareCard
                            key={ref.id ?? `${ref.kind}-${ref.entityId}`}
                            name={ref.title}
                            phone={phone}
                            email={email}
                            href={ref.href}
                          />
                        );
                      }
                      return (
                        <ShareEntityCard
                          key={ref.id ?? `${ref.kind}-${ref.entityId}`}
                          item={ref}
                        />
                      );
                    })}
                    {(note.files ?? []).map((file) => (
                      <FileShareCard key={file.id} file={file} />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleAdd} className="space-y-2 border-t border-app px-3 py-2.5">
        {(draft.refs ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {draft.refs!.map((ref) => (
              <span
                key={`${ref.kind}-${ref.entityId}`}
                className="inline-flex items-center gap-1"
              >
                <RefChip item={ref} />
                <button
                  type="button"
                  aria-label={`Retirer ${ref.title}`}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      refs: (draft.refs ?? []).filter(
                        (item) =>
                          !(item.kind === ref.kind && item.entityId === ref.entityId)
                      ),
                    })
                  }
                  className="text-glass-muted hover:text-glass"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {(draft.files ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {draft.files!.map((file, index) => (
              <span
                key={`${file.name}-${index}`}
                className="inline-flex items-center gap-1 rounded-full border border-glass px-2 py-0.5 text-[11px] text-glass"
              >
                {file.name}
                <button
                  type="button"
                  aria-label={`Retirer ${file.name}`}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      files: (draft.files ?? []).filter((_, i) => i !== index),
                    })
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-1.5">
          <div className="relative shrink-0" data-share-anchor>
            <button
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              aria-label="Partager un élément du cabinet"
              aria-expanded={pickerOpen}
              aria-haspopup="menu"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border border-glass transition",
                pickerOpen
                  ? "bg-studio-light text-white dark:text-[#0a0a0f]"
                  : "text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
              )}
            >
              <Share2 className="h-4 w-4" />
            </button>
            <ShareNotePicker
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onPick={(item) => {
                addRef(item);
                setPickerOpen(false);
              }}
            />
          </div>
          <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-glass text-glass-muted transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light">
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Joindre un fichier</span>
            <input
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                setDraft({
                  ...draft,
                  files: [...(draft.files ?? []), ...picked].slice(0, 8),
                });
                e.target.value = "";
              }}
            />
          </label>
          <textarea
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Écrire un message…"
            rows={1}
            className={cn(
              glassInput,
              "max-h-28 min-h-10 flex-1 resize-none px-3 py-2.5 text-[13px]"
            )}
          />
          <button
            type="submit"
            disabled={createNote.isPending || !hasDraft(draft)}
            aria-label="Envoyer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-studio-light text-white transition hover:opacity-90 disabled:opacity-40 dark:text-[#0a0a0f]"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </section>
  );
}
