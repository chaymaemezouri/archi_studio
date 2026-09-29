"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  CheckSquare,
  ChevronLeft,
  CreditCard,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Gavel,
  Image as ImageIcon,
  PenTool,
  Receipt,
  UserRound,
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useDevisList } from "@/hooks/useDevis";
import { useDocuments } from "@/hooks/useDocuments";
import { useInvoices } from "@/hooks/useInvoices";
import { usePayments } from "@/hooks/usePayments";
import { usePlansRenders } from "@/hooks/usePlansRenders";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTenders } from "@/hooks/useTenders";
import {
  refFromClient,
  refFromDevis,
  refFromDocument,
  refFromInvoice,
  refFromPayment,
  refFromPlanRender,
  refFromProject,
  refFromTask,
  refFromTender,
  type SharedNoteRefDraft,
} from "@/hooks/useSharedNotes";
import { glassDropdownPlain, glassInput } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const KINDS = [
  { id: "CLIENT" as const, label: "Contact", plural: "Contacts", empty: "Aucun contact.", icon: UserRound },
  { id: "PROJECT" as const, label: "Projet", plural: "Projets", empty: "Aucun projet.", icon: FolderKanban },
  { id: "DOCUMENT" as const, label: "Document", plural: "Documents", empty: "Aucun document.", icon: FileText },
  { id: "PLAN" as const, label: "Plan", plural: "Plans", empty: "Aucun plan.", icon: PenTool },
  { id: "RENDER" as const, label: "Image", plural: "Images", empty: "Aucune image.", icon: ImageIcon },
  { id: "DEVIS" as const, label: "Devis", plural: "Devis", empty: "Aucun devis.", icon: FileSpreadsheet },
  { id: "INVOICE" as const, label: "Facture", plural: "Factures", empty: "Aucune facture.", icon: Receipt },
  { id: "PAYMENT" as const, label: "Paiement", plural: "Paiements", empty: "Aucun paiement.", icon: CreditCard },
  { id: "TASK" as const, label: "Tâche", plural: "Tâches", empty: "Aucune tâche.", icon: CheckSquare },
  { id: "TENDER" as const, label: "Appel d'offres", plural: "Appels d'offres", empty: "Aucun appel d'offres.", icon: Gavel },
];

type KindId = (typeof KINDS)[number]["id"];

export default function ShareNotePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (ref: SharedNoteRefDraft) => void;
}) {
  const [kind, setKind] = useState<KindId | null>(null);
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<CSSProperties>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: documents = [], isLoading: documentsLoading } = useDocuments();
  const { data: assets = [], isLoading: assetsLoading } = usePlansRenders();
  const { data: devis = [], isLoading: devisLoading } = useDevisList();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: tenders = [], isLoading: tendersLoading } = useTenders();

  useEffect(() => {
    if (!open) {
      setKind(null);
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = document.querySelector("[data-share-anchor]");
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const width = 288;
      setStyle({
        position: "fixed",
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
        bottom: window.innerHeight - rect.top + 8,
        width,
        maxHeight: Math.max(180, rect.top - 16),
        zIndex: 200,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, kind]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (kind) {
        setKind(null);
        setQuery("");
        return;
      }
      onClose();
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (panelRef.current?.contains(target)) return;
      if (target?.closest("[data-share-anchor]")) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, kind, onClose]);

  const selected = KINDS.find((item) => item.id === kind) ?? null;

  const items = useMemo(() => {
    if (!selected) return [];
    const all: SharedNoteRefDraft[] =
      selected.id === "CLIENT"
        ? clients.map(refFromClient)
        : selected.id === "PROJECT"
          ? projects.map(refFromProject)
          : selected.id === "DOCUMENT"
            ? documents.map(refFromDocument)
            : selected.id === "PLAN" || selected.id === "RENDER"
              ? assets.filter((asset) => asset.kind === selected.id).map(refFromPlanRender)
              : selected.id === "DEVIS"
                ? devis.map(refFromDevis)
                : selected.id === "INVOICE"
                  ? invoices.map(refFromInvoice)
                  : selected.id === "PAYMENT"
                    ? payments.map(refFromPayment)
                    : selected.id === "TASK"
                      ? tasks.map(refFromTask)
                      : tenders.map(refFromTender);
    const needle = query.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((item) =>
      `${item.title} ${item.subtitle ?? ""}`.toLowerCase().includes(needle)
    );
  }, [selected, clients, projects, documents, assets, devis, invoices, payments, tasks, tenders, query]);

  const loading =
    (kind === "CLIENT" && clientsLoading) ||
    (kind === "PROJECT" && projectsLoading) ||
    (kind === "DOCUMENT" && documentsLoading) ||
    ((kind === "PLAN" || kind === "RENDER") && assetsLoading) ||
    (kind === "DEVIS" && devisLoading) ||
    (kind === "INVOICE" && invoicesLoading) ||
    (kind === "PAYMENT" && paymentsLoading) ||
    (kind === "TASK" && tasksLoading) ||
    (kind === "TENDER" && tendersLoading);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className={cn(glassDropdownPlain, "flex flex-col overflow-hidden p-0")}
    >
      {selected == null ? (
        <ul
          className="overflow-y-auto py-1"
          style={{ maxHeight: style.maxHeight }}
          role="menu"
          aria-label="Partager dans la discussion"
        >
          {KINDS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setKind(item.id);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-glass transition hover:bg-[color:var(--glass-bg-hover)]"
                >
                  <Icon className="h-4 w-4 text-studio-light" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div>
          <div className="flex items-center gap-1 border-b border-app px-1.5 py-1.5">
            <button
              type="button"
              onClick={() => {
                setKind(null);
                setQuery("");
              }}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] text-glass transition hover:bg-[color:var(--glass-bg-hover)]"
            >
              <ChevronLeft className="h-4 w-4" />
              {selected.plural}
            </button>
          </div>
          <div className="px-2 pt-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Rechercher un ${selected.label.toLowerCase()}`}
              className={cn(glassInput, "h-9 px-3 py-1.5 text-[13px]")}
              autoFocus
            />
          </div>
          <ul
            className="overflow-y-auto p-1"
            style={{ maxHeight: Math.max(120, Number(style.maxHeight ?? 320) - 96) }}
            role="listbox"
            aria-label={selected.plural}
          >
            {loading ? (
              <li className="px-2 py-3 text-[12px] text-glass-muted">Chargement…</li>
            ) : items.length === 0 ? (
              <li className="px-2 py-3 text-[12px] text-glass-muted">
                {query.trim() ? "Aucun résultat." : selected.empty}
              </li>
            ) : (
              items.map((item) => (
                <li key={`${item.kind}-${item.entityId}`}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => onPick(item)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-[color:var(--glass-bg-hover)]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-glass">{item.title}</span>
                      {item.subtitle && (
                        <span className="block truncate text-[11px] text-glass-muted">{item.subtitle}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>,
    document.body
  );
}
