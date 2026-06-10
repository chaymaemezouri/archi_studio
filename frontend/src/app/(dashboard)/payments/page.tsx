"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, CreditCard, Plus, Search, SlidersHorizontal } from "lucide-react";
import FinanceRowActions, {
  FinanceMenuItem,
  FinanceMenuLink,
} from "@/components/finances/FinanceRowActions";
import PaymentForm from "@/components/finances/PaymentForm";
import {
  financeDesktopTable,
  financeMobileList,
  PaymentMobileCard,
} from "@/components/finances/FinanceMobileList";
import {
  paymentsListPage,
  paymentsListPanel,
  paymentsStatCard,
  paymentsTable,
  paymentsTableHead,
  paymentsTableRow,
  paymentsTableWrap,
} from "@/components/payments/payments-list-ui";
import { useDialog } from "@/components/providers/DialogProvider";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePayments, useCreatePayment, useUpdatePayment, useDeletePayment, type PaymentInput } from "@/hooks/usePayments";
import { useInvoices } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import type { InvoiceStatus, Payment, PaymentMethod } from "@/types";
import {
  accentBar,
  dropdownItem,
  dropdownItemActive,
  dropdownItemInactive,
  dropdownSectionLabel,
  glassBtnIcon,
  glassDropdownPlain,
  glassInput,
} from "@/lib/glass-styles";
import { downloadPaymentReceiptPdf } from "@/lib/finance-pdf";
import {
  getInvoiceFinanceHref,
  getPaymentClientId,
  getPaymentClientName,
} from "@/lib/payment-utils";
import { sumRemainingToCollectAcrossProjects } from "@/lib/project-finance";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { INVOICE_STATUS_LABELS } from "@/types";
import toast from "react-hot-toast";

type PeriodFilter = "all" | "today" | "week" | "month" | "year" | "custom";
type LinkFilter = "all" | "with_invoice" | "without_invoice" | "with_project" | "with_client";
type SortBy = "recent" | "oldest" | "amount_desc" | "amount_asc" | "client_asc" | "invoice" | "method";

const METHOD_OPTIONS: { value: PaymentMethod | "all"; label: string }[] = [
  { value: "all", label: "Toutes méthodes" },
  { value: "ESPECES", label: "Espèces" },
  { value: "VIREMENT", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "CARTE", label: "Carte" },
  { value: "AUTRE", label: "Autre" },
];

const STATUS_FILTERS: { value: InvoiceStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous statuts facture" },
  { value: "PAID", label: "Payées" },
  { value: "PARTIAL", label: "Partiellement payées" },
  { value: "UNPAID", label: "Impayées" },
  { value: "OVERDUE", label: "En retard" },
];

const PERIOD_FILTERS: { value: PeriodFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "year", label: "Cette année" },
  { value: "custom", label: "Personnalisé" },
];

const LINK_FILTERS: { value: LinkFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "with_invoice", label: "Liés à une facture" },
  { value: "without_invoice", label: "Non liés à une facture" },
  { value: "with_project", label: "Liés à un projet" },
  { value: "with_client", label: "Liés à un client" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "recent", label: "Plus récents" },
  { value: "oldest", label: "Plus anciens" },
  { value: "amount_desc", label: "Montant élevé" },
  { value: "amount_asc", label: "Montant faible" },
  { value: "client_asc", label: "Client A-Z" },
  { value: "invoice", label: "Facture" },
  { value: "method", label: "Méthode" },
];

const paymentMethodLabel: Record<PaymentMethod, string> = {
  ESPECES: "Espèces",
  VIREMENT: "Virement",
  CHEQUE: "Chèque",
  CARTE: "Carte",
  AUTRE: "Autre",
};

function isWithinPeriod(date: string, period: PeriodFilter, from?: string, to?: string) {
  const d = new Date(date);
  const now = new Date();
  if (period === "all") return true;
  if (period === "today") return d.toDateString() === now.toDateString();
  if (period === "week") {
    const start = new Date(now);
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  }
  if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (period === "year") return d.getFullYear() === now.getFullYear();
  if (period === "custom") {
    if (from && d < new Date(from)) return false;
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  }
  return true;
}

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: invoices = [] } = useInvoices();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const { confirm } = useDialog();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 300);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [method, setMethod] = useState<PaymentMethod | "all">("all");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [linkFilter, setLinkFilter] = useState<LinkFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [createDefaults, setCreateDefaults] = useState<{
    clientId?: string;
    projectId?: string;
  }>({});
  const [receiptPdfLoadingId, setReceiptPdfLoadingId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newKind = searchParams.get("new");
    const clientIdParam = searchParams.get("clientId");
    const projectIdParam = searchParams.get("projectId");

    if (newKind !== "payment" && !clientIdParam && !projectIdParam) return;

    setCreateDefaults({
      clientId: clientIdParam ?? undefined,
      projectId: projectIdParam ?? undefined,
    });
    setEditing(null);
    setIsModalOpen(true);
    router.replace("/payments", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    if (!filterOpen) return;
    const close = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [filterOpen]);

  useEffect(() => {
    if (!sortOpen) return;
    const close = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [sortOpen]);

  const { data: payments = [], isLoading, isError, refetch } = usePayments();

  const enrichedInvoices = useMemo(
    () =>
      invoices
        .filter((inv) => inv.clientId || inv.client?.id)
        .map((inv) => ({
        id: inv.id,
        number: inv.number,
        totalTTC: inv.totalTTC,
        paidAmount: inv.paidAmount ?? 0,
        clientId: inv.clientId ?? undefined,
        projectId: inv.projectId ?? undefined,
        client: inv.client ? { id: inv.client.id, name: inv.client.name } : null,
        project: inv.project
          ? {
              id: inv.project.id,
              name: inv.project.name,
              clientId: inv.project.clientId ?? inv.project.client?.id,
              client: inv.project.client
                ? { id: inv.project.client.id, name: inv.project.client.name }
                : null,
            }
          : null,
      })),
    [invoices]
  );

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    const list = payments.filter((p) => {
      if (!isWithinPeriod(p.date, period, customFrom, customTo)) return false;
      if (method !== "all" && p.method !== method) return false;
      if (statusFilter !== "all" && p.invoice?.status !== statusFilter) return false;
      if (linkFilter === "with_invoice" && !p.invoiceId) return false;
      if (linkFilter === "without_invoice" && p.invoiceId) return false;
      if (linkFilter === "with_project" && !p.projectId && !p.invoice?.projectId) return false;
      if (linkFilter === "with_client" && !getPaymentClientId(p, projects)) return false;
      if (!q) return true;
      const clientName = getPaymentClientName(p, projects);
      const projectName = p.project?.name ?? p.invoice?.project?.name ?? "";
      const haystack = [
        p.reference ?? "",
        clientName,
        projectName,
        p.invoice?.number ?? "",
        paymentMethodLabel[p.method] ?? p.method,
        p.notes ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortBy === "recent") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount_desc") return b.amount - a.amount;
      if (sortBy === "amount_asc") return a.amount - b.amount;
      if (sortBy === "client_asc") {
        const ac = getPaymentClientName(a, projects).toLowerCase();
        const bc = getPaymentClientName(b, projects).toLowerCase();
        return ac.localeCompare(bc, "fr");
      }
      if (sortBy === "invoice") return (a.invoice?.number ?? "").localeCompare(b.invoice?.number ?? "", "fr");
      if (sortBy === "method") return paymentMethodLabel[a.method].localeCompare(paymentMethodLabel[b.method], "fr");
      return 0;
    });
    return sorted;
  }, [payments, projects, debounced, period, customFrom, customTo, method, statusFilter, linkFilter, sortBy]);

  const stats = useMemo(() => {
    const now = new Date();
    const month = payments.filter((p) => {
      const d = new Date(p.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const year = payments.filter((p) => new Date(p.date).getFullYear() === now.getFullYear());
    const totalMonth = month.reduce((sum, p) => sum + p.amount, 0);
    const totalYear = year.reduce((sum, p) => sum + p.amount, 0);
    const restFromProjects = sumRemainingToCollectAcrossProjects(projects, payments);
    const restFromInvoices = invoices
      .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
      .reduce((sum, i) => sum + Math.max(0, i.totalTTC - (i.paidAmount ?? 0)), 0);
    const rest = restFromProjects > 0 ? restFromProjects : restFromInvoices;
    const unpaidInvoices = invoices.filter((i) => ["UNPAID", "OVERDUE", "PARTIAL", "SENT"].includes(i.status)).length;
    return { totalMonth, totalYear, rest, unpaidInvoices };
  }, [payments, invoices, projects]);

  const hasActiveFilters =
    query.trim() !== "" ||
    period !== "all" ||
    method !== "all" ||
    statusFilter !== "all" ||
    linkFilter !== "all";

  const resetFilters = useCallback(() => {
    setQuery("");
    setPeriod("all");
    setMethod("all");
    setStatusFilter("all");
    setLinkFilter("all");
    setSortBy("recent");
    setCustomFrom("");
    setCustomTo("");
  }, []);

  const openCreate = () => {
    setEditing(null);
    setCreateDefaults({});
    setIsModalOpen(true);
  };

  const openEdit = (payment: Payment) => {
    setEditing(payment);
    setIsModalOpen(true);
  };

  const confirmDeletePayment = async (id: string) => {
    if (
      await confirm({
        title: "Supprimer le paiement",
        message: "Supprimer ce paiement ?",
        confirmLabel: "Supprimer",
        variant: "danger",
      })
    ) {
      deletePayment.mutate(id);
    }
  };

  const submitForm = (payload: PaymentInput) => {
    if (editing) {
      updatePayment.mutate({ id: editing.id, ...payload }, { onSuccess: () => setIsModalOpen(false) });
      return;
    }
    const returnProjectId = createDefaults.projectId;
    createPayment.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        setCreateDefaults({});
        if (returnProjectId) {
          router.push(`/projects/${returnProjectId}?tab=finances`);
        }
      },
    });
  };

  const loadingMutation = createPayment.isPending || updatePayment.isPending;

  return (
    <div className={paymentsListPage}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-app-primary sm:text-2xl">
            <span className={accentBar} aria-hidden />
            Paiements
          </h1>
          <p className="mt-0.5 text-xs text-glass-muted sm:text-sm">
            Suivez les paiements reçus et les montants restants à encaisser
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="hidden h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-app bg-[color:var(--glass-bg)] px-4 text-sm font-medium text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light sm:inline-flex"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Ajouter un paiement
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <div className={paymentsStatCard}>
          <p className="text-[10px] text-glass-muted">Encaissé ce mois</p>
          <p className="mt-1 text-sm font-semibold text-glass">
            {formatCurrency(stats.totalMonth)}
          </p>
        </div>
        <div className={paymentsStatCard}>
          <p className="text-[10px] text-glass-muted">Encaissé cette année</p>
          <p className="mt-1 text-sm font-semibold text-glass">
            {formatCurrency(stats.totalYear)}
          </p>
        </div>
        <div className={paymentsStatCard}>
          <p className="text-[10px] text-glass-muted">Reste à encaisser</p>
          <p className="mt-1 text-sm font-semibold text-glass">
            {formatCurrency(stats.rest)}
          </p>
        </div>
        <div className={paymentsStatCard}>
          <p className="text-[10px] text-glass-muted">Factures impayées</p>
          <p className="mt-1 text-sm font-semibold text-glass">{stats.unpaidInvoices}</p>
        </div>
      </div>

      <div
        className={cn(
          paymentsListPanel,
          (filterOpen || sortOpen) && "relative z-40"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-app bg-[color:var(--glass-bg)] text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light sm:hidden"
            aria-label="Ajouter un paiement"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-glass-muted"
              strokeWidth={1.75}
            />
            <input
              type="search"
              placeholder="Rechercher un paiement, client, facture ou projet…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(glassInput, "h-9 py-0 pl-9 pr-3 text-[13px]")}
              aria-label="Rechercher des paiements"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setFilterOpen((v) => !v);
                  setSortOpen(false);
                }}
                className={cn(
                  glassBtnIcon,
                  "relative h-9 w-9 shrink-0 px-0 sm:w-auto sm:gap-1.5 sm:px-3",
                  (filterOpen || hasActiveFilters) &&
                    "border-studio-border/40 bg-studio-soft text-studio-light"
                )}
                aria-label="Filtrer les paiements"
                aria-expanded={filterOpen}
                aria-haspopup="dialog"
              >
                <SlidersHorizontal className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="hidden text-[13px] font-medium sm:inline">Filtres</span>
                {hasActiveFilters && (
                  <span
                    className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-studio-light sm:hidden"
                    aria-hidden
                  />
                )}
              </button>

              {filterOpen && (
                <div
                  role="dialog"
                  aria-label="Filtres paiements"
                  className={cn(
                    glassDropdownPlain,
                    "absolute left-0 top-full z-50 mt-1.5 w-[min(260px,calc(100vw-2rem))] max-h-[min(70vh,480px)] overflow-y-auto sm:left-auto sm:right-0"
                  )}
                >
                <p className={dropdownSectionLabel}>Période</p>
                {PERIOD_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setPeriod(f.value)}
                    className={cn(
                      dropdownItem,
                      period === f.value ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}
                {period === "custom" && (
                  <div className="space-y-1.5 px-3 py-2">
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className={cn(glassInput, "h-8 w-full py-0 text-[12px]")}
                      aria-label="Date de début"
                    />
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className={cn(glassInput, "h-8 w-full py-0 text-[12px]")}
                      aria-label="Date de fin"
                    />
                  </div>
                )}

                <p className={cn(dropdownSectionLabel, "mt-1")}>Méthode</p>
                {METHOD_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setMethod(f.value)}
                    className={cn(
                      dropdownItem,
                      method === f.value ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}

                <p className={cn(dropdownSectionLabel, "mt-1")}>Statut facture</p>
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      dropdownItem,
                      statusFilter === f.value ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}

                <p className={cn(dropdownSectionLabel, "mt-1")}>Lien</p>
                {LINK_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setLinkFilter(f.value)}
                    className={cn(
                      dropdownItem,
                      linkFilter === f.value ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      resetFilters();
                      setFilterOpen(false);
                    }}
                    className={cn(dropdownItem, dropdownItemInactive, "mt-1 text-[12px]")}
                  >
                    Réinitialiser les filtres
                  </button>
                )}
                </div>
              )}
            </div>

            <div ref={sortRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setSortOpen((v) => !v);
                  setFilterOpen(false);
                }}
                className={cn(
                  glassBtnIcon,
                  "h-9 w-9 shrink-0 px-0 sm:w-auto sm:gap-1 sm:px-2.5",
                  sortOpen && "border-studio-border/40 bg-studio-soft text-studio-light"
                )}
                aria-label="Trier les paiements"
                aria-expanded={sortOpen}
                aria-haspopup="listbox"
                title={SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Trier"}
              >
                <span className="hidden max-w-[7rem] truncate text-xs font-medium sm:inline">
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Trier"}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 transition", sortOpen && "rotate-180")}
                  strokeWidth={1.75}
                />
              </button>

              {sortOpen && (
                <ul
                  role="listbox"
                  aria-label="Trier les paiements"
                  className={cn(
                    glassDropdownPlain,
                    "absolute right-0 top-full z-50 mt-1.5 min-w-[200px]"
                  )}
                >
                  {SORT_OPTIONS.map((o) => (
                    <li key={o.value} role="option" aria-selected={sortBy === o.value}>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy(o.value);
                          setSortOpen(false);
                        }}
                        className={cn(
                          dropdownItem,
                          sortBy === o.value ? dropdownItemActive : dropdownItemInactive
                        )}
                      >
                        {o.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#8ba4c7]/30 border-t-[#8ba4c7]" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={CreditCard}
          title="Impossible de charger les paiements"
          description="Une erreur est survenue lors du chargement."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Aucun paiement enregistré"
          description="Ajoutez un paiement pour suivre vos encaissements."
          actionLabel="Ajouter un paiement"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Aucun paiement ne correspond à votre recherche"
          description="Ajustez votre recherche ou vos filtres."
          actionLabel="Réinitialiser les filtres"
          onAction={resetFilters}
        />
      ) : (
        <>
        <div className={financeMobileList}>
          {filtered.map((p) => {
            const client = getPaymentClientName(p, projects);
            const project = p.project?.name ?? p.invoice?.project?.name ?? "—";
            const invoice = p.invoice?.number ?? "Non liée";
            const clientId = getPaymentClientId(p, projects);
            const projectId = p.projectId ?? p.invoice?.projectId;

            return (
              <PaymentMobileCard
                key={p.id}
                payment={p}
                client={client}
                project={project}
                invoice={invoice}
                methodLabel={paymentMethodLabel[p.method]}
                invoiceStatus={
                  p.invoice ? INVOICE_STATUS_LABELS[p.invoice.status] : "—"
                }
                actions={
                  <FinanceRowActions
                    id={p.id}
                    onEdit={() => openEdit(p)}
                    onDelete={() => void confirmDeletePayment(p.id)}
                    menuItems={
                      <>
                        {p.invoice?.id && (
                          <FinanceMenuLink href={getInvoiceFinanceHref(p.invoice.id)}>
                            Ouvrir facture liée
                          </FinanceMenuLink>
                        )}
                        {clientId && (
                          <FinanceMenuLink href={`/clients/${clientId}`}>
                            Ouvrir client lié
                          </FinanceMenuLink>
                        )}
                        {projectId && (
                          <FinanceMenuLink href={`/projects/${projectId}`}>
                            Ouvrir projet lié
                          </FinanceMenuLink>
                        )}
                        {p.proofUrl && (
                          <FinanceMenuItem
                            label="Télécharger justificatif"
                            onClick={() =>
                              window.open(p.proofUrl!, "_blank", "noopener,noreferrer")
                            }
                          />
                        )}
                        <FinanceMenuItem
                          label={
                            receiptPdfLoadingId === p.id
                              ? "Génération PDF…"
                              : "Télécharger reçu PDF"
                          }
                          onClick={async () => {
                            setReceiptPdfLoadingId(p.id);
                            try {
                              const datePart = p.date.slice(0, 10);
                              await downloadPaymentReceiptPdf(
                                p.id,
                                `recu-${datePart}-${p.id.slice(0, 6)}.pdf`
                              );
                            } catch {
                              toast.error("Impossible de générer le reçu PDF");
                            } finally {
                              setReceiptPdfLoadingId(null);
                            }
                          }}
                        />
                      </>
                    }
                  />
                }
              />
            );
          })}
        </div>
        <div className={cn(paymentsTableWrap, financeDesktopTable)}>
          <table className={paymentsTable}>
            <thead>
              <tr className={paymentsTableHead}>
                <th className="px-4 py-2.5">Référence</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Client</th>
                <th className="px-4 py-2.5">Projet</th>
                <th className="px-4 py-2.5">Facture</th>
                <th className="px-4 py-2.5">Montant</th>
                <th className="px-4 py-2.5">Méthode</th>
                <th className="px-4 py-2.5">Statut facture</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const client = getPaymentClientName(p, projects);
                const project = p.project?.name ?? p.invoice?.project?.name ?? "—";
                const invoice = p.invoice?.number ?? "Non liée";
                const clientId = getPaymentClientId(p, projects);
                const projectId = p.projectId ?? p.invoice?.projectId;

                return (
                  <tr key={p.id} className={paymentsTableRow}>
                    <td className="px-4 py-2.5 text-glass">{p.reference ?? "—"}</td>
                    <td className="px-4 py-2.5 text-glass-secondary">{formatDate(p.date)}</td>
                    <td className="px-4 py-2.5 text-glass-secondary">{client}</td>
                    <td className="px-4 py-2.5 text-glass-secondary">{project}</td>
                    <td className="px-4 py-2.5 text-glass-secondary">{invoice}</td>
                    <td className="px-4 py-2.5 font-medium tabular-nums text-glass">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-glass-secondary">
                      {paymentMethodLabel[p.method]}
                    </td>
                    <td className="px-4 py-2.5 text-glass-secondary">
                      {p.invoice ? INVOICE_STATUS_LABELS[p.invoice.status] : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <FinanceRowActions
                        id={p.id}
                        onEdit={() => openEdit(p)}
                        onDelete={() => void confirmDeletePayment(p.id)}
                        menuItems={
                          <>
                            {p.invoice?.id && (
                              <FinanceMenuLink href={getInvoiceFinanceHref(p.invoice.id)}>
                                Ouvrir facture liée
                              </FinanceMenuLink>
                            )}
                            {clientId && (
                              <FinanceMenuLink href={`/clients/${clientId}`}>
                                Ouvrir client lié
                              </FinanceMenuLink>
                            )}
                            {projectId && (
                              <FinanceMenuLink href={`/projects/${projectId}`}>
                                Ouvrir projet lié
                              </FinanceMenuLink>
                            )}
                            {p.proofUrl && (
                              <FinanceMenuItem
                                label="Télécharger justificatif"
                                onClick={() =>
                                  window.open(p.proofUrl!, "_blank", "noopener,noreferrer")
                                }
                              />
                            )}
                            <FinanceMenuItem
                              label={
                                receiptPdfLoadingId === p.id
                                  ? "Génération PDF…"
                                  : "Télécharger reçu PDF"
                              }
                              onClick={async () => {
                                setReceiptPdfLoadingId(p.id);
                                try {
                                  const datePart = p.date.slice(0, 10);
                                  await downloadPaymentReceiptPdf(
                                    p.id,
                                    `recu-${datePart}-${p.id.slice(0, 6)}.pdf`
                                  );
                                } catch {
                                  toast.error("Impossible de générer le reçu PDF");
                                } finally {
                                  setReceiptPdfLoadingId(null);
                                }
                              }}
                            />
                          </>
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? "Modifier le paiement" : "Ajouter un paiement"}
        size="lg"
        variant="glass"
      >
        <PaymentForm
          key={`${editing?.id ?? "new"}-${createDefaults.clientId ?? ""}-${createDefaults.projectId ?? ""}`}
          payment={editing}
          defaultClientId={createDefaults.clientId}
          defaultProjectId={createDefaults.projectId}
          invoices={enrichedInvoices}
          clients={clients.map((c) => ({ id: c.id, name: c.name }))}
          projects={projects.map((p) => ({
            id: p.id,
            name: p.name,
            clientId: p.clientId ?? p.client?.id,
            client: p.client ? { id: p.client.id, name: p.client.name } : null,
            totalProjectAmount: p.totalProjectAmount,
            contractArchitectFees: p.contractArchitectFees,
            actualFeesToCollect: p.actualFeesToCollect,
            budget: p.budget,
          }))}
          allPayments={payments}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={submitForm}
          loading={loadingMutation}
        />
      </Modal>
    </div>
  );
}

