"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  CircleDollarSign,
  FileSpreadsheet,
  Plus,
  Receipt,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import DevisForm, { type DevisFormValues } from "@/components/devis/DevisForm";
import InvoiceForm, { type InvoiceFormValues } from "@/components/invoices/InvoiceForm";
import FinanceProjectShell from "@/components/finances/FinanceProjectShell";
import FinanceRowActions, { FinanceMenuItem } from "@/components/finances/FinanceRowActions";
import {
  DevisMobileCard,
  financeDesktopTable,
  financeMobileList,
  InvoiceMobileCard,
} from "@/components/finances/FinanceMobileList";
import PaymentModal from "@/components/finances/PaymentModal";
import {
  quotesInvoicesListPage,
  quotesInvoicesPanel,
  quotesInvoicesTabActive,
  quotesInvoicesTabInactive,
  quotesInvoicesTable,
  quotesInvoicesTableHead,
  quotesInvoicesTableRow,
  quotesInvoicesTableWrap,
} from "@/components/finances/quotes-invoices-ui";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import { useDialog } from "@/components/providers/DialogProvider";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  getFinanceClientLabel,
  getFinanceProjectLabel,
} from "@/lib/finance-entity-utils";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import {
  useConvertDevisToInvoice,
  useCreateDevis,
  useDevisList,
  useDeleteDevis,
  useDuplicateDevis,
  useUpdateDevis,
} from "@/hooks/useDevis";
import {
  useCreateInvoice,
  useDeleteInvoice,
  useDuplicateInvoice,
  useInvoices,
  useUpdateInvoice,
} from "@/hooks/useInvoices";
import { useCreatePayment } from "@/hooks/usePayments";
import { groupDevisByProject, groupInvoicesByProject } from "@/lib/finance-group";
import { downloadFinancePdf } from "@/lib/finance-pdf";
import { normalizeFinanceLineItems } from "@/lib/finance-items";
import {
  filterDevis,
  filterInvoices,
  invoiceRemaining,
  type FinanceListFilters,
  type FinancePeriodFilter,
  type FinanceSort,
  type FinanceTab,
  type FinanceTypeFilter,
} from "@/lib/finance-list";
import {
  DEVIS_STATUS_COLORS,
  DEVIS_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  type Devis,
  type DevisStatus,
  type Invoice,
  type InvoiceStatus,
} from "@/types";
import {
  accentBar,
  dropdownItem,
  dropdownItemActive,
  dropdownItemInactive,
  dropdownSectionLabel,
  glassBtnIcon,
  glassDropdownPlain,
  glassInput,
  glassMenu,
} from "@/lib/glass-styles";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const SORT_OPTIONS: { id: FinanceSort; label: string }[] = [
  { id: "recent", label: "Plus récents" },
  { id: "oldest", label: "Plus anciens" },
  { id: "amount_desc", label: "Montant élevé" },
  { id: "amount_asc", label: "Montant faible" },
  { id: "client_asc", label: "Client A-Z" },
  { id: "status", label: "Statut" },
];

const TYPE_FILTERS: { id: FinanceTypeFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "devis", label: "Devis" },
  { id: "invoices", label: "Factures" },
];

const PERIOD_FILTERS: { id: FinancePeriodFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "month", label: "Ce mois" },
  { id: "year", label: "Cette année" },
  { id: "custom", label: "Personnalisé" },
];

export default function QuotesInvoicesPage() {
  const { data: devis = [], isLoading: devisLoading, isError: devisError, refetch: refetchDevis } =
    useDevisList();
  const { data: invoices = [], isLoading: invLoading, isError: invError, refetch: refetchInv } =
    useInvoices();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();

  const createDevis = useCreateDevis();
  const updateDevis = useUpdateDevis();
  const deleteDevis = useDeleteDevis();
  const convertDevis = useConvertDevisToInvoice();
  const duplicateDevis = useDuplicateDevis();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const duplicateInvoice = useDuplicateInvoice();
  const createPayment = useCreatePayment();

  const { confirm } = useDialog();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tab, setTab] = useState<FinanceTab>("devis");
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<"devis" | "invoice">("devis");
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const createToolbarRef = useRef<HTMLDivElement>(null);
  const [modalDefaults, setModalDefaults] = useState<{
    clientId?: string;
    projectId?: string;
  }>({});

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [typeFilter, setTypeFilter] = useState<FinanceTypeFilter>("all");
  const [devisStatusFilter, setDevisStatusFilter] = useState<DevisStatus | "all">("all");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [periodFilter, setPeriodFilter] = useState<FinancePeriodFilter>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | "all">("all");
  const [clientFilter, setClientFilter] = useState<string | "all">("all");
  const [sort, setSort] = useState<FinanceSort>("recent");

  const defaultClientId = searchParams.get("clientId") ?? undefined;
  const defaultProjectId = searchParams.get("projectId") ?? undefined;
  const initialTab = searchParams.get("tab");

  useEffect(() => {
    if (initialTab === "invoices") setTab("invoices");

    const newKind = searchParams.get("new");
    if (newKind === "devis") {
      setModalDefaults({
        clientId: searchParams.get("clientId") ?? undefined,
        projectId: searchParams.get("projectId") ?? undefined,
      });
      setModalKind("devis");
      setEditingDevis(null);
      setEditingInvoice(null);
      setModalOpen(true);
      setTab("devis");
      router.replace("/finances/quotes-invoices", { scroll: false });
      return;
    }
    if (newKind === "invoice") {
      setModalDefaults({
        clientId: searchParams.get("clientId") ?? undefined,
        projectId: searchParams.get("projectId") ?? undefined,
      });
      setModalKind("invoice");
      setEditingInvoice(null);
      setEditingDevis(null);
      setModalOpen(true);
      setTab("invoices");
      router.replace("/finances/quotes-invoices", { scroll: false });
      return;
    }

    const editKind = searchParams.get("edit");
    const editId = searchParams.get("id");
    if (editKind === "devis" && editId) {
      const found = devis.find((d) => d.id === editId);
      if (found) {
        setModalKind("devis");
        setEditingDevis(found);
        setEditingInvoice(null);
        setModalOpen(true);
        setTab("devis");
        router.replace("/finances/quotes-invoices", { scroll: false });
      }
      return;
    }
    if (editKind === "invoice" && editId) {
      const found = invoices.find((i) => i.id === editId);
      if (found) {
        setModalKind("invoice");
        setEditingInvoice(found);
        setEditingDevis(null);
        setModalOpen(true);
        setTab("invoices");
        router.replace("/finances/quotes-invoices", { scroll: false });
      }
    }
  }, [searchParams, router, initialTab, devis, invoices]);

  useEffect(() => {
    if (!createMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (createMenuRef.current?.contains(target) || createToolbarRef.current?.contains(target)) {
        return;
      }
      setCreateMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [createMenuOpen]);

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

  useEffect(() => {
    if (typeFilter === "devis") setTab("devis");
    if (typeFilter === "invoices") setTab("invoices");
  }, [typeFilter]);

  const filters: FinanceListFilters = useMemo(
    () => ({
      query: debouncedSearch,
      typeFilter,
      devisStatusFilter,
      invoiceStatusFilter,
      periodFilter,
      customFrom,
      customTo,
      projectFilter,
      clientFilter,
      sort,
    }),
    [
      debouncedSearch,
      typeFilter,
      devisStatusFilter,
      invoiceStatusFilter,
      periodFilter,
      customFrom,
      customTo,
      projectFilter,
      clientFilter,
      sort,
    ]
  );

  const filteredDevis = useMemo(() => filterDevis(devis, filters), [devis, filters]);
  const filteredInvoices = useMemo(
    () => filterInvoices(invoices, filters),
    [invoices, filters]
  );

  const devisGroups = useMemo(
    () => groupDevisByProject(filteredDevis),
    [filteredDevis]
  );

  const invoiceGroups = useMemo(
    () => groupInvoicesByProject(filteredInvoices),
    [filteredInvoices]
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== "all" ||
    devisStatusFilter !== "all" ||
    invoiceStatusFilter !== "all" ||
    periodFilter !== "all" ||
    projectFilter !== "all" ||
    clientFilter !== "all";

  const resetFilters = useCallback(() => {
    setSearch("");
    setTypeFilter("all");
    setDevisStatusFilter("all");
    setInvoiceStatusFilter("all");
    setPeriodFilter("all");
    setCustomFrom("");
    setCustomTo("");
    setProjectFilter("all");
    setClientFilter("all");
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setModalDefaults({});
  };

  const refreshFinanceLists = async () => {
    await Promise.all([refetchDevis(), refetchInv()]);
  };

  const onFinanceMutationSuccess = async () => {
    await refreshFinanceLists();
    closeModal();
  };

  const openCreateDevis = () => {
    setModalDefaults({});
    setModalKind("devis");
    setEditingDevis(null);
    setEditingInvoice(null);
    setModalOpen(true);
    setCreateMenuOpen(false);
  };

  const openCreateInvoice = () => {
    setModalDefaults({});
    setModalKind("invoice");
    setEditingInvoice(null);
    setEditingDevis(null);
    setModalOpen(true);
    setCreateMenuOpen(false);
  };

  const openEditDevis = (d: Devis) => {
    setModalKind("devis");
    setEditingDevis(d);
    setEditingInvoice(null);
    setModalOpen(true);
  };

  const openEditInvoice = (inv: Invoice) => {
    setModalKind("invoice");
    setEditingInvoice(inv);
    setEditingDevis(null);
    setModalOpen(true);
  };

  const handleDevisSubmit = (values: DevisFormValues) => {
    let items;
    try {
      items = normalizeFinanceLineItems(values.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lignes invalides");
      return;
    }
    const payload = {
      clientId: values.clientId || undefined,
      clientName: values.clientName?.trim() || undefined,
      projectId: values.projectId || undefined,
      projectName: values.projectName?.trim() || undefined,
      object: values.object.trim(),
      status: values.status,
      tva: values.tva,
      paymentTerms: values.paymentTerms,
      notes: values.notes || undefined,
      validUntil: values.validUntil || undefined,
      items,
    };
    if (editingDevis) {
      updateDevis.mutate({ id: editingDevis.id, ...payload }, { onSuccess: onFinanceMutationSuccess });
    } else {
      createDevis.mutate(payload, { onSuccess: onFinanceMutationSuccess });
    }
  };

  const handleInvoiceSubmit = (values: InvoiceFormValues) => {
    if (!values.clientId) {
      toast.error("Sélectionnez un client dans la liste");
      return;
    }
    let items;
    try {
      items = normalizeFinanceLineItems(values.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lignes invalides");
      return;
    }
    const payload = {
      clientId: values.clientId,
      projectId: values.projectId || undefined,
      projectName: values.projectName?.trim() || undefined,
      object: values.object.trim(),
      status: values.status,
      tva: values.tva,
      issueDate: values.issueDate,
      paymentMethod: values.paymentMethod || undefined,
      bankTransferBy: values.bankTransferBy || undefined,
      notes: values.notes || undefined,
      items,
    };
    if (editingInvoice) {
      updateInvoice.mutate({ id: editingInvoice.id, ...payload }, { onSuccess: onFinanceMutationSuccess });
    } else {
      createInvoice.mutate(payload, { onSuccess: onFinanceMutationSuccess });
    }
  };

  const handleDownloadPdf = async (type: "devis" | "invoices", doc: Devis | Invoice) => {
    setPdfLoadingId(doc.id);
    try {
      await downloadFinancePdf(type, doc.id, `${type === "devis" ? "devis" : "facture"}-${doc.number}.pdf`);
    } catch {
      toast.error("Impossible de générer le PDF");
    } finally {
      setPdfLoadingId(null);
    }
  };

  const confirmDeleteDevis = async (d: Devis) => {
    if (
      await confirm({
        title: "Supprimer le devis",
        message: `Supprimer le devis ${d.number} ?`,
        confirmLabel: "Supprimer",
        variant: "danger",
      })
    ) {
      deleteDevis.mutate(d.id);
    }
  };

  const confirmDeleteInvoice = async (inv: Invoice) => {
    if (
      await confirm({
        title: "Supprimer la facture",
        message: `Supprimer la facture ${inv.number} ?`,
        confirmLabel: "Supprimer",
        variant: "danger",
      })
    ) {
      deleteInvoice.mutate(inv.id);
    }
  };

  const isLoading = devisLoading || invLoading;
  const isError = devisError || invError;

  const showDevisStatusFilter = tab === "devis" || typeFilter === "devis" || typeFilter === "all";
  const showInvoiceStatusFilter =
    tab === "invoices" || typeFilter === "invoices" || typeFilter === "all";

  return (
    <div className={quotesInvoicesListPage}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-app-primary sm:text-2xl">
            <span className={accentBar} aria-hidden />
            Devis & Factures
          </h1>
          <p className="mt-0.5 text-xs text-glass-muted sm:text-sm">
            Gérez vos devis, notes d&apos;honoraires et documents financiers
          </p>
        </div>
        <div
          ref={createMenuRef}
          className={cn("relative hidden shrink-0 sm:block", createMenuOpen && "z-40")}
        >
          <button
            type="button"
            onClick={() => {
              setCreateMenuOpen((v) => !v);
              setFilterOpen(false);
              setSortOpen(false);
            }}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-app bg-[color:var(--glass-bg)] px-4 text-sm font-medium text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light"
            aria-expanded={createMenuOpen}
            aria-haspopup="menu"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Créer
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          </button>
          {createMenuOpen && (
            <div
              role="menu"
              className={cn(glassMenu, "absolute right-0 top-full z-50 mt-1.5 min-w-[200px] py-1")}
            >
              <button
                type="button"
                role="menuitem"
                onClick={openCreateDevis}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
              >
                <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} />
                Nouveau devis
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={openCreateInvoice}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
              >
                <Receipt className="h-4 w-4" strokeWidth={1.75} />
                Nouvelle facture
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-app">
        {(["devis", "invoices"] as FinanceTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition",
              tab === t ? quotesInvoicesTabActive : quotesInvoicesTabInactive
            )}
          >
            {t === "devis" ? `Devis (${devis.length})` : `Factures (${invoices.length})`}
          </button>
        ))}
      </div>

      <div
        className={cn(
          quotesInvoicesPanel,
          (filterOpen || sortOpen || createMenuOpen) && "relative z-40"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            ref={createToolbarRef}
            className={cn("relative shrink-0 sm:hidden", createMenuOpen && "z-40")}
          >
            <button
              type="button"
              onClick={() => {
                setCreateMenuOpen((v) => !v);
                setFilterOpen(false);
                setSortOpen(false);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app bg-[color:var(--glass-bg)] text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light"
              aria-label="Créer"
              aria-expanded={createMenuOpen}
              aria-haspopup="menu"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </button>
            {createMenuOpen && (
              <div
                role="menu"
                className={cn(glassMenu, "absolute left-0 top-full z-50 mt-1.5 min-w-[200px] py-1")}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={openCreateDevis}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
                >
                  <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} />
                  Nouveau devis
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={openCreateInvoice}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
                >
                  <Receipt className="h-4 w-4" strokeWidth={1.75} />
                  Nouvelle facture
                </button>
              </div>
            )}
          </div>

          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-glass-muted"
              strokeWidth={1.75}
            />
            <input
              type="search"
              placeholder="Rechercher un devis, une facture, un client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(glassInput, "h-9 py-0 pl-9 pr-3 text-[13px]")}
              aria-label="Rechercher"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setFilterOpen((v) => !v);
                  setSortOpen(false);
                  setCreateMenuOpen(false);
                }}
                className={cn(
                  glassBtnIcon,
                  "relative h-9 w-9 shrink-0 px-0 sm:w-auto sm:gap-1.5 sm:px-3",
                  (filterOpen || hasActiveFilters) &&
                    "border-studio-border/40 bg-studio-soft text-studio-light"
                )}
                aria-label="Filtrer"
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
                  aria-label="Filtres devis et factures"
                  className={cn(
                    glassDropdownPlain,
                    "absolute left-0 top-full z-50 mt-1.5 w-[min(260px,calc(100vw-2rem))] max-h-[min(70vh,480px)] overflow-y-auto sm:left-auto sm:right-0"
                  )}
                >
                <p className={dropdownSectionLabel}>Type</p>
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTypeFilter(f.id)}
                    className={cn(
                      dropdownItem,
                      typeFilter === f.id ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}

                {showDevisStatusFilter && (
                  <>
                    <p className={cn(dropdownSectionLabel, "mt-1")}>Statut devis</p>
                    <button
                      type="button"
                      onClick={() => setDevisStatusFilter("all")}
                      className={cn(
                        dropdownItem,
                        devisStatusFilter === "all" ? dropdownItemActive : dropdownItemInactive
                      )}
                    >
                      Tous
                    </button>
                    {Object.entries(DEVIS_STATUS_LABELS).map(([k, v]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setDevisStatusFilter(k as DevisStatus)}
                        className={cn(
                          dropdownItem,
                          devisStatusFilter === k ? dropdownItemActive : dropdownItemInactive
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </>
                )}

                {showInvoiceStatusFilter && (
                  <>
                    <p className={cn(dropdownSectionLabel, "mt-1")}>Statut facture</p>
                    <button
                      type="button"
                      onClick={() => setInvoiceStatusFilter("all")}
                      className={cn(
                        dropdownItem,
                        invoiceStatusFilter === "all" ? dropdownItemActive : dropdownItemInactive
                      )}
                    >
                      Tous
                    </button>
                    {Object.entries(INVOICE_STATUS_LABELS).map(([k, v]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setInvoiceStatusFilter(k as InvoiceStatus)}
                        className={cn(
                          dropdownItem,
                          invoiceStatusFilter === k ? dropdownItemActive : dropdownItemInactive
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </>
                )}

                <p className={cn(dropdownSectionLabel, "mt-1")}>Période</p>
                {PERIOD_FILTERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriodFilter(p.id)}
                    className={cn(
                      dropdownItem,
                      periodFilter === p.id ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {p.label}
                  </button>
                ))}

                {periodFilter === "custom" && (
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

                <p className={cn(dropdownSectionLabel, "mt-1")}>Projet</p>
                <div className="max-h-[140px] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setProjectFilter("all")}
                    className={cn(
                      dropdownItem,
                      projectFilter === "all" ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    Tous les projets
                  </button>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProjectFilter(p.id)}
                      className={cn(
                        dropdownItem,
                        projectFilter === p.id ? dropdownItemActive : dropdownItemInactive
                      )}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <p className={cn(dropdownSectionLabel, "mt-1")}>Client</p>
                <div className="max-h-[140px] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setClientFilter("all")}
                    className={cn(
                      dropdownItem,
                      clientFilter === "all" ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    Tous les clients
                  </button>
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClientFilter(c.id)}
                      className={cn(
                        dropdownItem,
                        clientFilter === c.id ? dropdownItemActive : dropdownItemInactive
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

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
                  setCreateMenuOpen(false);
                }}
                className={cn(
                  glassBtnIcon,
                  "h-9 w-9 shrink-0 px-0 sm:w-auto sm:gap-1 sm:px-2.5",
                  sortOpen && "border-studio-border/40 bg-studio-soft text-studio-light"
                )}
                aria-label="Trier"
                aria-expanded={sortOpen}
                aria-haspopup="listbox"
                title={SORT_OPTIONS.find((o) => o.id === sort)?.label ?? "Trier"}
              >
                <span className="hidden max-w-[7rem] truncate text-xs font-medium sm:inline">
                  {SORT_OPTIONS.find((o) => o.id === sort)?.label ?? "Trier"}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 transition", sortOpen && "rotate-180")}
                  strokeWidth={1.75}
                />
              </button>

              {sortOpen && (
                <ul
                  role="listbox"
                  aria-label="Trier devis et factures"
                  className={cn(
                    glassDropdownPlain,
                    "absolute right-0 top-full z-50 mt-1.5 min-w-[200px]"
                  )}
                >
                  {SORT_OPTIONS.map((o) => (
                    <li key={o.id} role="option" aria-selected={sort === o.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSort(o.id);
                          setSortOpen(false);
                        }}
                        className={cn(
                          dropdownItem,
                          sort === o.id ? dropdownItemActive : dropdownItemInactive
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

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#8ba4c7]/30 border-t-[#8ba4c7]" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={FileSpreadsheet}
          title="Erreur de chargement"
          description="Impossible de récupérer les données."
          actionLabel="Réessayer"
          onAction={() => { refetchDevis(); refetchInv(); }}
        />
      )}

      {!isLoading && !isError && tab === "devis" && (
        <>
          {devis.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="Aucun devis créé"
              description="Créez votre premier devis pour un client ou un projet."
              actionLabel="Créer un devis"
              onAction={openCreateDevis}
            />
          ) : filteredDevis.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="Aucun résultat ne correspond à votre recherche"
              description="Modifiez vos filtres ou réinitialisez la recherche."
              actionLabel="Réinitialiser les filtres"
              onAction={resetFilters}
            />
          ) : (
            <div className="space-y-3">
            {devisGroups.map((group) => (
              <FinanceProjectShell
                key={group.key}
                projectId={group.projectId}
                projectName={group.projectName}
                count={group.items.length}
                countLabel={group.items.length === 1 ? "devis" : "devis"}
                totalAmount={group.totalAmount}
              >
            <div className={financeMobileList}>
              {group.items.map((d) => (
                <DevisMobileCard
                  key={d.id}
                  devis={d}
                  actions={
                    <FinanceRowActions
                      id={d.id}
                      pdfLoading={pdfLoadingId === d.id}
                      onEdit={() => openEditDevis(d)}
                      onDownloadPdf={() => handleDownloadPdf("devis", d)}
                      onDelete={() => void confirmDeleteDevis(d)}
                      menuItems={
                        <>
                          {d.status === "DRAFT" && (
                            <FinanceMenuItem
                              label="Marquer comme envoyé"
                              onClick={() => updateDevis.mutate({ id: d.id, status: "SENT" })}
                            />
                          )}
                          {d.status === "SENT" && (
                            <>
                              <FinanceMenuItem
                                label="Marquer comme accepté"
                                onClick={() =>
                                  updateDevis.mutate({ id: d.id, status: "ACCEPTED" })
                                }
                              />
                              <FinanceMenuItem
                                label="Marquer comme refusé"
                                onClick={() =>
                                  updateDevis.mutate({ id: d.id, status: "REFUSED" })
                                }
                              />
                            </>
                          )}
                          {d.status === "ACCEPTED" && (
                            <FinanceMenuItem
                              label="Convertir en facture"
                              onClick={() => convertDevis.mutate(d.id)}
                            />
                          )}
                          <FinanceMenuItem
                            label="Dupliquer"
                            onClick={() => duplicateDevis.mutate(d)}
                          />
                        </>
                      }
                    />
                  }
                />
              ))}
            </div>
            <div className={cn(quotesInvoicesTableWrap, financeDesktopTable)}>
              <table className={quotesInvoicesTable}>
                <thead>
                  <tr className={quotesInvoicesTableHead}>
                    <th className="px-4 py-2.5">N°</th>
                    <th className="px-4 py-2.5">Client</th>
                    <th className="px-4 py-2.5">Projet</th>
                    <th className="px-4 py-2.5">Objet</th>
                    <th className="px-4 py-2.5">HT</th>
                    <th className="px-4 py-2.5">TTC</th>
                    <th className="px-4 py-2.5">Statut</th>
                    <th className="px-4 py-2.5">Créé</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((d) => (
                    <tr key={d.id} className={quotesInvoicesTableRow}>
                      <td className="px-4 py-2.5 font-medium text-glass">{d.number}</td>
                      <td className="px-4 py-2.5 text-glass-secondary">{getFinanceClientLabel(d)}</td>
                      <td className="px-4 py-2.5 text-glass-secondary">{getFinanceProjectLabel(d)}</td>
                      <td className=" truncate px-4 py-2.5 text-glass-secondary">
                        {d.object ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-[#9aa3b0]/75">
                        {formatCurrency(d.totalHT)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-[#9aa3b0]/75">
                        {formatCurrency(d.totalTTC)}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge className={DEVIS_STATUS_COLORS[d.status]}>
                          {DEVIS_STATUS_LABELS[d.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-glass-muted">{formatDate(d.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <FinanceRowActions
                          id={d.id}
                          pdfLoading={pdfLoadingId === d.id}
                          onEdit={() => openEditDevis(d)}
                          onDownloadPdf={() => handleDownloadPdf("devis", d)}
                          onDelete={() => void confirmDeleteDevis(d)}
                          menuItems={
                            <>
                              {d.status === "DRAFT" && (
                                <FinanceMenuItem
                                  label="Marquer comme envoyé"
                                  onClick={() => updateDevis.mutate({ id: d.id, status: "SENT" })}
                                />
                              )}
                              {d.status === "SENT" && (
                                <>
                                  <FinanceMenuItem
                                    label="Marquer comme accepté"
                                    onClick={() =>
                                      updateDevis.mutate({ id: d.id, status: "ACCEPTED" })
                                    }
                                  />
                                  <FinanceMenuItem
                                    label="Marquer comme refusé"
                                    onClick={() =>
                                      updateDevis.mutate({ id: d.id, status: "REFUSED" })
                                    }
                                  />
                                </>
                              )}
                              {d.status === "ACCEPTED" && (
                                <FinanceMenuItem
                                  label="Convertir en facture"
                                  onClick={() => convertDevis.mutate(d.id)}
                                />
                              )}
                              <FinanceMenuItem
                                label="Dupliquer"
                                onClick={() => duplicateDevis.mutate(d)}
                              />
                            </>
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              </FinanceProjectShell>
            ))}
            </div>
          )}
        </>
      )}

      {!isLoading && !isError && tab === "invoices" && (
        <>
          {invoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Aucune facture créée"
              description="Créez votre première note d'honoraires."
              actionLabel="Créer une facture"
              onAction={openCreateInvoice}
            />
          ) : filteredInvoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Aucun résultat ne correspond à votre recherche"
              description="Modifiez vos filtres ou réinitialisez la recherche."
              actionLabel="Réinitialiser les filtres"
              onAction={resetFilters}
            />
          ) : (
            <div className="space-y-3">
            {invoiceGroups.map((group) => (
              <FinanceProjectShell
                key={group.key}
                projectId={group.projectId}
                projectName={group.projectName}
                count={group.items.length}
                countLabel={group.items.length === 1 ? "facture" : "factures"}
                totalAmount={group.totalAmount}
              >
            <div className={financeMobileList}>
              {group.items.map((inv) => {
                const remaining = invoiceRemaining(inv);
                return (
                  <InvoiceMobileCard
                    key={inv.id}
                    invoice={inv}
                    remaining={remaining}
                    actions={
                      <FinanceRowActions
                        id={inv.id}
                        pdfLoading={pdfLoadingId === inv.id}
                        onEdit={() => openEditInvoice(inv)}
                        onDownloadPdf={() => handleDownloadPdf("invoices", inv)}
                        onDelete={() => void confirmDeleteInvoice(inv)}
                        extraIcons={
                          <IconActionButton
                            label="Ajouter paiement"
                            icon={CircleDollarSign}
                            tone="upload"
                            onClick={() => setPaymentInvoice(inv)}
                          />
                        }
                        menuItems={
                          <>
                            {inv.status === "DRAFT" && (
                              <FinanceMenuItem
                                label="Marquer comme envoyée"
                                onClick={() =>
                                  updateInvoice.mutate({ id: inv.id, status: "SENT" })
                                }
                              />
                            )}
                            {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                              <FinanceMenuItem
                                label="Marquer comme payée"
                                onClick={() =>
                                  updateInvoice.mutate({ id: inv.id, status: "PAID" })
                                }
                              />
                            )}
                            <FinanceMenuItem
                              label="Dupliquer"
                              onClick={() => duplicateInvoice.mutate(inv)}
                            />
                          </>
                        }
                      />
                    }
                  />
                );
              })}
            </div>
            <div className={cn(quotesInvoicesTableWrap, financeDesktopTable)}>
              <table className={cn(quotesInvoicesTable, "min-w-[1000px]")}>
                <thead>
                  <tr className={quotesInvoicesTableHead}>
                    <th className="px-4 py-2.5">N°</th>
                    <th className="px-4 py-2.5">Client</th>
                    <th className="px-4 py-2.5">Projet</th>
                    <th className="px-4 py-2.5">Objet</th>
                    <th className="px-4 py-2.5">TTC</th>
                    <th className="px-4 py-2.5">Payé</th>
                    <th className="px-4 py-2.5">Reste</th>
                    <th className="px-4 py-2.5">Statut</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((inv) => {
                    const remaining = invoiceRemaining(inv);
                    return (
                      <tr key={inv.id} className={quotesInvoicesTableRow}>
                        <td className="px-4 py-2.5 font-medium text-glass">{inv.number}</td>
                        <td className="px-4 py-2.5 text-glass-secondary">{getFinanceClientLabel(inv)}</td>
                        <td className="px-4 py-2.5 text-glass-secondary">{getFinanceProjectLabel(inv)}</td>
                        <td className="max-w-[160px] truncate px-4 py-2.5 text-glass-secondary">
                          {inv.object ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-[#9aa3b0]/75">
                          {formatCurrency(inv.totalTTC)}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-emerald-400/85">
                          {formatCurrency(inv.paidAmount ?? 0)}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-[#9aa3b0]/75">
                          {formatCurrency(remaining)}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge className={INVOICE_STATUS_COLORS[inv.status]}>
                            {INVOICE_STATUS_LABELS[inv.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <FinanceRowActions
                            id={inv.id}
                            pdfLoading={pdfLoadingId === inv.id}
                            onEdit={() => openEditInvoice(inv)}
                            onDownloadPdf={() => handleDownloadPdf("invoices", inv)}
                            onDelete={() => void confirmDeleteInvoice(inv)}
                            extraIcons={
                              <IconActionButton
                                label="Ajouter paiement"
                                icon={CircleDollarSign}
                                tone="upload"
                                onClick={() => setPaymentInvoice(inv)}
                              />
                            }
                            menuItems={
                              <>
                                {inv.status === "DRAFT" && (
                                  <FinanceMenuItem
                                    label="Marquer comme envoyée"
                                    onClick={() =>
                                      updateInvoice.mutate({ id: inv.id, status: "SENT" })
                                    }
                                  />
                                )}
                                {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                                  <FinanceMenuItem
                                    label="Marquer comme payée"
                                    onClick={() =>
                                      updateInvoice.mutate({ id: inv.id, status: "PAID" })
                                    }
                                  />
                                )}
                                <FinanceMenuItem
                                  label="Dupliquer"
                                  onClick={() => duplicateInvoice.mutate(inv)}
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
              </FinanceProjectShell>
            ))}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          modalKind === "devis"
            ? editingDevis ? `Devis ${editingDevis.number}` : "Nouveau devis"
            : editingInvoice ? `Facture ${editingInvoice.number}` : "Nouvelle facture"
        }
        size="xl"
        variant="glass"
      >
        {modalKind === "devis" ? (
          <DevisForm
            initialData={editingDevis ?? undefined}
            clients={clients}
            projects={projects}
            defaultClientId={modalDefaults.clientId ?? defaultClientId}
            defaultProjectId={modalDefaults.projectId ?? defaultProjectId}
            onSubmit={handleDevisSubmit}
            loading={createDevis.isPending || updateDevis.isPending}
          />
        ) : (
          <InvoiceForm
            initialData={editingInvoice ?? undefined}
            clients={clients}
            projects={projects}
            defaultClientId={modalDefaults.clientId ?? defaultClientId}
            defaultProjectId={modalDefaults.projectId ?? defaultProjectId}
            onSubmit={handleInvoiceSubmit}
            loading={createInvoice.isPending || updateInvoice.isPending}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        title="Ajouter un paiement"
        size="md"
        variant="glass"
      >
        {paymentInvoice && (
          <PaymentModal
            invoice={paymentInvoice}
            onClose={() => setPaymentInvoice(null)}
            loading={createPayment.isPending}
            onSubmit={(data) => {
              createPayment.mutate(data, { onSuccess: () => setPaymentInvoice(null) });
            }}
          />
        )}
      </Modal>
    </div>
  );
}
