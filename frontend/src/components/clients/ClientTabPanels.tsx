"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FolderKanban,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useDialog } from "@/components/providers/DialogProvider";
import { getInvoiceFinanceHref } from "@/lib/payment-utils";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import ProjectTabSectionHeader from "@/components/projects/detail/ProjectTabSectionHeader";
import CreateProjectDrawer from "@/components/projects/CreateProjectDrawer";
import ClientProfileOverview from "./ClientProfileOverview";
import ClientTabSection from "./ClientTabSection";
import {
  detailChecklistDate,
  detailChecklistEmpty,
  detailChecklistItem,
  detailChecklistItemTitle,
  detailChecklistList,
  detailChecklistNotes,
  detailChecklistSection,
  detailChecklistStatusBadge,
  detailChecklistStatusMissing,
  detailChecklistStatusUploaded,
  detailChecklistStatusValidated,
  detailFinanceStatGrid,
  detailFinanceStatLabel,
  detailFinanceStatValue,
  detailFinanceStatValueSuccess,
  detailFinanceStatValueWarning,
  detailIconActionGroup,
  detailNotesBodyInput,
  detailNotesComposer,
  detailNotesTitleInput,
} from "./client-detail-ui";
import {
  useCreateClientDocument,
  useCreateClientNote,
  useDeleteClientDocument,
  useDeleteClientNote,
  useUpdateClientNote,
} from "@/hooks/useClients";
import { useUpdateDevis } from "@/hooks/useDevis";
import { useUpdateInvoice } from "@/hooks/useInvoices";
import { uploadClientFile } from "@/lib/client-upload";
import { resolveMediaUrl } from "@/lib/assets";
import type { ClientTabId } from "./ClientDetailTabs";
import {
  CLIENT_DOCUMENT_TYPE_LABELS,
  DEVIS_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
  PHASE_LABELS,
  type Client,
  type PaymentMethod,
  type Project,
} from "@/types";
import { cn, formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  VIREMENT: "Virement",
  CHEQUE: "Chèque",
  ESPECES: "Espèces",
  CARTE: "Carte",
  AUTRE: "Autre",
};

interface ClientTabPanelsProps {
  client: Client;
  tab: ClientTabId;
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <li className={detailChecklistItem}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-studio-muted">
        <FolderKanban className="h-4 w-4 text-glass-muted" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <Link
          href={`/projects/${project.id}`}
          className={cn(detailChecklistItemTitle, "hover:text-[#8ba4c7]/90")}
        >
          {project.name}
        </Link>
        <p className={detailChecklistDate}>
          {[project.city, PHASE_LABELS[project.phase], `${project.progress}%`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <span
        className={cn(
          detailChecklistStatusBadge,
          project.status === "ACTIVE"
            ? detailChecklistStatusUploaded
            : detailChecklistStatusValidated
        )}
      >
        {project.status === "ACTIVE" ? "Actif" : "Archivé"}
      </span>
      <div className={detailIconActionGroup}>
        <IconActionButton
          label="Ouvrir le projet"
          icon={Eye}
          tone="view"
          href={`/projects/${project.id}`}
        />
      </div>
    </li>
  );
}

export default function ClientTabPanels({ client, tab }: ClientTabPanelsProps) {
  const { confirm } = useDialog();
  const updateDevis = useUpdateDevis();
  const updateInvoice = useUpdateInvoice();
  const createNote = useCreateClientNote(client.id);
  const updateNote = useUpdateClientNote(client.id);
  const deleteNote = useDeleteClientNote(client.id);
  const createDocument = useCreateClientDocument(client.id);
  const deleteDocument = useDeleteClientDocument(client.id);

  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fs = client.financialSummary;
  const projectDrawer = (
    <CreateProjectDrawer
      isOpen={projectDrawerOpen}
      onClose={() => setProjectDrawerOpen(false)}
      defaultClientId={client.id}
    />
  );

  if (tab === "overview") {
    const recentProjects = (client.projects ?? []).slice(0, 4);
    const recentActivity = (client.activityLogs ?? []).slice(0, 5);

    return (
      <div className="space-y-4">
        {fs && (
          <ClientTabSection title="Résumé financier">
            <div className={cn(detailFinanceStatGrid, "mt-3")}>
              <div>
                <p className={detailFinanceStatLabel}>Total devis</p>
                <p className={detailFinanceStatValue}>{formatCurrency(fs.totalQuotes)}</p>
              </div>
              <div>
                <p className={detailFinanceStatLabel}>Total facturé</p>
                <p className={detailFinanceStatValue}>{formatCurrency(fs.totalInvoiced)}</p>
              </div>
              <div>
                <p className={detailFinanceStatLabel}>Total payé</p>
                <p className={cn(detailFinanceStatValue, detailFinanceStatValueSuccess)}>
                  {formatCurrency(fs.totalPaid)}
                </p>
              </div>
              <div>
                <p className={detailFinanceStatLabel}>Reste à payer</p>
                <p className={cn(detailFinanceStatValue, detailFinanceStatValueWarning)}>
                  {formatCurrency(fs.remainingAmount)}
                </p>
              </div>
              <div>
                <p className={detailFinanceStatLabel}>Factures impayées</p>
                <p className={detailFinanceStatValue}>{fs.unpaidInvoicesCount}</p>
              </div>
            </div>
          </ClientTabSection>
        )}

        <ClientProfileOverview client={client} />

        <div className="grid gap-4 lg:grid-cols-2">
          <ClientTabSection
            title="Projets récents"
            count={client.projects?.length}
            action={{
              label: "Ajouter un projet",
              icon: Plus,
              onClick: () => setProjectDrawerOpen(true),
            }}
          >
            {recentProjects.length === 0 ? (
              <p className={detailChecklistEmpty}>Aucun projet lié à ce client.</p>
            ) : (
              <ul className={detailChecklistList}>
                {recentProjects.map((p) => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </ul>
            )}
          </ClientTabSection>

          <ClientTabSection
            title="Activité récente"
            action={
              (client.activityLogs?.length ?? 0) > 0
                ? {
                    label: "Voir toute l'activité",
                    icon: Eye,
                    href: `/clients/${client.id}?tab=activity`,
                  }
                : undefined
            }
          >
            {recentActivity.length === 0 ? (
              <p className={detailChecklistEmpty}>Aucune activité enregistrée.</p>
            ) : (
              <ul className={detailChecklistList}>
                {recentActivity.map((a) => (
                  <li key={a.id} className={detailChecklistItem}>
                    <div className="min-w-0 flex-1">
                      <p className={detailChecklistItemTitle}>
                        <span className="text-[#8ba4c7]/75">{a.user?.name ?? "Système"}</span>
                        {" · "}
                        {a.action} {a.entity}
                      </p>
                      <p className={detailChecklistDate}>{formatRelativeTime(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ClientTabSection>
        </div>

        {projectDrawer}
      </div>
    );
  }

  if (tab === "projects") {
    const projects = client.projects ?? [];
    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Projets"
          count={projects.length}
          action={{
            label: "Ajouter un projet",
            icon: Plus,
            onClick: () => setProjectDrawerOpen(true),
          }}
        />
        {projects.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucun projet lié à ce client.</p>
        ) : (
          <ul className={detailChecklistList}>
            {projects.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </ul>
        )}
        {projectDrawer}
      </section>
    );
  }

  if (tab === "quotes") {
    const devis = client.devis ?? [];
    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Devis"
          count={devis.length}
          action={{
            label: "Créer un devis",
            icon: Plus,
            href: `/finances/quotes-invoices?new=devis&clientId=${client.id}`,
          }}
        />
        {devis.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucun devis pour ce client.</p>
        ) : (
          <ul className={detailChecklistList}>
            {devis.map((d) => (
              <li key={d.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/finances/quotes-invoices?edit=devis&id=${d.id}`}
                    className={cn(detailChecklistItemTitle, "hover:text-[#8ba4c7]/90")}
                  >
                    Devis {d.number}
                  </Link>
                  <p className={detailChecklistDate}>
                    {d.project?.name ?? "—"} · {formatCurrency(d.totalTTC)} ·{" "}
                    {formatDate(d.createdAt)}
                  </p>
                </div>
                <span className={cn(detailChecklistStatusBadge, detailChecklistStatusUploaded)}>
                  {DEVIS_STATUS_LABELS[d.status]}
                </span>
                <div className={detailIconActionGroup}>
                  <IconActionButton
                    label="Ouvrir"
                    icon={Eye}
                    tone="view"
                    href={`/finances/quotes-invoices?edit=devis&id=${d.id}`}
                  />
                  {d.status === "SENT" && (
                    <>
                      <IconActionButton
                        label="Marquer accepté"
                        icon={CheckCircle2}
                        tone="success"
                        onClick={() => updateDevis.mutate({ id: d.id, status: "ACCEPTED" })}
                      />
                      <IconActionButton
                        label="Marquer refusé"
                        icon={X}
                        tone="danger"
                        onClick={() => updateDevis.mutate({ id: d.id, status: "REFUSED" })}
                      />
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "invoices") {
    const invoices = client.invoices ?? [];
    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Factures"
          count={invoices.length}
          action={{
            label: "Créer une facture",
            icon: Plus,
            href: `/finances/quotes-invoices?new=invoice&clientId=${client.id}`,
          }}
        />
        {invoices.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucune facture pour ce client.</p>
        ) : (
          <ul className={detailChecklistList}>
            {invoices.map((inv) => (
              <li key={inv.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className={cn(detailChecklistItemTitle, "hover:text-[#8ba4c7]/90")}
                  >
                    {inv.number}
                  </Link>
                  <p className={detailChecklistDate}>
                    {inv.project?.name ?? "—"} · {formatCurrency(inv.totalTTC)}
                    {inv.dueDate ? ` · ${formatDate(inv.dueDate)}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    detailChecklistStatusBadge,
                    inv.status === "PAID"
                      ? detailChecklistStatusValidated
                      : detailChecklistStatusMissing
                  )}
                >
                  {INVOICE_STATUS_LABELS[inv.status]}
                </span>
                <div className={detailIconActionGroup}>
                  <IconActionButton
                    label="Ouvrir"
                    icon={Eye}
                    tone="view"
                    href={getInvoiceFinanceHref(inv.id)}
                  />
                  {inv.status !== "PAID" && (
                    <IconActionButton
                      label="Marquer payée"
                      icon={CheckCircle2}
                      tone="success"
                      onClick={async () => {
                        const ok = await confirm({
                          title: "Facture payée",
                          message: "Marquer comme payée ?",
                          confirmLabel: "Marquer payée",
                        });
                        if (ok) updateInvoice.mutate({ id: inv.id, status: "PAID" });
                      }}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "payments") {
    const payments = client.payments ?? [];
    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Paiements"
          count={payments.length}
          action={{
            label: "Ajouter un paiement",
            icon: Plus,
            href: `/payments?clientId=${client.id}`,
          }}
        />
        {payments.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucun paiement enregistré.</p>
        ) : (
          <ul className={detailChecklistList}>
            {payments.map((p) => (
              <li key={p.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <p className={detailChecklistItemTitle}>{formatCurrency(p.amount)}</p>
                  <p className={detailChecklistDate}>
                    Facture {p.invoice?.number ?? "—"} · {formatDate(p.date)} ·{" "}
                    {PAYMENT_METHOD_LABELS[p.method]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "documents") {
    const docs = client.clientDocuments ?? [];

    const handleUpload = async (file: File) => {
      setUploading(true);
      try {
        const uploaded = await uploadClientFile(client.id, file);
        await createDocument.mutateAsync({
          name: uploaded.originalName || file.name,
          url: uploaded.url,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
          docType: "OTHER",
        });
      } finally {
        setUploading(false);
      }
    };

    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader
          title="Documents"
          count={docs.length}
          action={{
            label: "Ajouter un document",
            icon: Upload,
            onClick: () => fileRef.current?.click(),
          }}
        />
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleUpload(f);
            e.target.value = "";
          }}
        />
        {docs.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucun document pour ce client.</p>
        ) : (
          <ul className={detailChecklistList}>
            {docs.map((doc) => (
              <li key={doc.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <p className={detailChecklistItemTitle}>{doc.name}</p>
                  <p className={detailChecklistDate}>
                    {CLIENT_DOCUMENT_TYPE_LABELS[doc.docType] ?? doc.docType} ·{" "}
                    {formatDate(doc.createdAt)}
                  </p>
                </div>
                <div className={detailIconActionGroup}>
                  <IconActionButton
                    label="Télécharger"
                    icon={Download}
                    tone="download"
                    href={resolveMediaUrl(doc.url) ?? doc.url}
                    target="_blank"
                    rel="noreferrer"
                  />
                  <IconActionButton
                    label="Supprimer"
                    icon={Trash2}
                    tone="danger"
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Supprimer le document",
                        message: "Supprimer ce document ?",
                        variant: "danger",
                        confirmLabel: "Supprimer",
                      });
                      if (ok) deleteDocument.mutate(doc.id);
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "notes") {
    const notes = client.clientNotes ?? [];

    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader title="Notes" count={notes.length} />

        <div className={cn(detailNotesComposer, "mt-3")}>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className={detailNotesTitleInput}
            aria-label="Titre de la note"
          />
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            className={detailNotesBodyInput}
            aria-label="Contenu de la note"
          />
          <div className="flex justify-end">
            <IconActionButton
              label="Ajouter la note"
              icon={Plus}
              tone="upload"
              onClick={() => {
                const body = noteDraft.trim();
                if (!body) return;
                const content = noteTitle.trim()
                  ? `${noteTitle.trim()}\n\n${body}`
                  : body;
                createNote.mutate(content, {
                  onSuccess: () => {
                    setNoteDraft("");
                    setNoteTitle("");
                  },
                });
              }}
              disabled={!noteDraft.trim() || createNote.isPending}
            />
          </div>
        </div>

        {notes.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucune note pour ce client.</p>
        ) : (
          <ul className={detailChecklistList}>
            {notes.map((note) => (
              <li key={note.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingNoteContent}
                        onChange={(e) => setEditingNoteContent(e.target.value)}
                        className={cn(detailNotesBodyInput, "min-h-[100px]")}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-[11px] font-medium text-[#8ba4c7]/90"
                          onClick={() =>
                            updateNote.mutate(
                              { noteId: note.id, content: editingNoteContent },
                              { onSuccess: () => setEditingNoteId(null) }
                            )
                          }
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          className="text-[11px] text-[#9aa3b0]/50"
                          onClick={() => setEditingNoteId(null)}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={detailChecklistItemTitle}>{note.content.split("\n")[0]}</p>
                      <p className={detailChecklistNotes}>{note.content}</p>
                      <p className={detailChecklistDate}>{formatDate(note.createdAt)}</p>
                    </>
                  )}
                </div>
                {editingNoteId !== note.id && (
                  <div className={detailIconActionGroup}>
                    <IconActionButton
                      label="Modifier"
                      icon={Pencil}
                      tone="notes"
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditingNoteContent(note.content);
                      }}
                    />
                    <IconActionButton
                      label="Supprimer"
                      icon={Trash2}
                      tone="danger"
                      onClick={async () => {
                        const ok = await confirm({
                          title: "Supprimer la note",
                          message: "Supprimer cette note ?",
                          variant: "danger",
                          confirmLabel: "Supprimer",
                        });
                        if (ok) deleteNote.mutate(note.id);
                      }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (tab === "activity") {
    const logs = client.activityLogs ?? [];
    const seen = new Set<string>();
    const unique = logs.filter((log) => {
      const key = `${log.action}-${log.entity}-${log.entityId}-${log.createdAt.slice(0, 16)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return (
      <section className={detailChecklistSection}>
        <ProjectTabSectionHeader title="Activité" count={unique.length} />
        {unique.length === 0 ? (
          <p className={detailChecklistEmpty}>Aucune activité enregistrée.</p>
        ) : (
          <ul className={cn(detailChecklistList, "mt-3")}>
            {unique.map((log) => (
              <li key={log.id} className={detailChecklistItem}>
                <div className="min-w-0 flex-1">
                  <p className={detailChecklistItemTitle}>
                    <span className="text-[#8ba4c7]/75">{log.user?.name ?? "Système"}</span>
                    {" · "}
                    {log.action}{" "}
                    <span className="text-glass-muted">{log.entity}</span>
                  </p>
                  <p className={detailChecklistDate}>
                    {formatRelativeTime(log.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return null;
}
