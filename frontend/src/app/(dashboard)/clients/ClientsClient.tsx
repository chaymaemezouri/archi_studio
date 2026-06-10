"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import ClientCard from "@/components/clients/ClientCard";
import ClientForm from "@/components/clients/ClientForm";
import ClientListRow, { ClientListHeader } from "@/components/clients/ClientListRow";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import {
  useClients,
  useCreateClient,
  useUpdateClient,
} from "@/hooks/useClients";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  filterAndSortClients,
  type ClientsFinanceFilter,
  type ClientsRelationFilter,
  type ClientsSort,
  type ClientsStatusFilter,
  type ClientsTypeFilter,
} from "@/lib/clients-list";
import { attachClientCinDocuments, type ClientCinUploads } from "@/lib/client-cin";
import type { Client } from "@/types";
import {
  clientsListGrid,
  clientsListPage,
  clientsListPanel,
  clientsListTable,
} from "@/components/clients/clients-list-ui";
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
import { cn } from "@/lib/utils";

const VIEW_STORAGE_KEY = "clients-list-view";

const STATUS_FILTERS: { id: ClientsStatusFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "ACTIVE", label: "Actifs" },
  { id: "INACTIVE", label: "Inactifs" },
  { id: "ARCHIVED", label: "Archivés" },
];

const TYPE_FILTERS: { id: ClientsTypeFilter; label: string }[] = [
  { id: "all", label: "Tous les types" },
  { id: "INDIVIDUAL", label: "Particulier" },
  { id: "COMPANY", label: "Entreprise" },
];

const RELATION_FILTERS: { id: ClientsRelationFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "with_projects", label: "Avec projets" },
  { id: "without_projects", label: "Sans projets" },
];

const FINANCE_FILTERS: { id: ClientsFinanceFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "pending_quotes", label: "Devis en attente" },
  { id: "unpaid_invoices", label: "Factures impayées" },
];

const SORT_OPTIONS: { id: ClientsSort; label: string }[] = [
  { id: "recent", label: "Plus récents" },
  { id: "oldest", label: "Plus anciens" },
  { id: "name", label: "Nom A–Z" },
  { id: "name_desc", label: "Nom Z–A" },
  { id: "activity", label: "Dernière activité" },
  { id: "projects", label: "Nombre de projets" },
  { id: "remaining", label: "Montant dû" },
];

export default function ClientsPage() {
  const { data: clients = [], isLoading, isError, refetch } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState<ClientsStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<ClientsTypeFilter>("all");
  const [relationFilter, setRelationFilter] = useState<ClientsRelationFilter>("all");
  const [financeFilter, setFinanceFilter] = useState<ClientsFinanceFilter>("all");
  const [sort, setSort] = useState<ClientsSort>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === "grid" || stored === "list") setView(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingClient(null);
      setModalOpen(true);
      router.replace("/clients", { scroll: false });
    }
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

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setRelationFilter("all");
    setFinanceFilter("all");
  }, []);

  const filtered = useMemo(
    () =>
      filterAndSortClients(clients, {
        query: debouncedSearch,
        statusFilter,
        typeFilter,
        relationFilter,
        financeFilter,
        sort,
      }),
    [
      clients,
      debouncedSearch,
      statusFilter,
      typeFilter,
      relationFilter,
      financeFilter,
      sort,
    ]
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    relationFilter !== "all" ||
    financeFilter !== "all";

  const openCreate = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: Partial<Client>, cinUploads?: ClientCinUploads) => {
    try {
      if (editingClient) {
        await updateClient.mutateAsync({ id: editingClient.id, ...payload });
        if (cinUploads?.front || cinUploads?.back) {
          await attachClientCinDocuments(editingClient.id, cinUploads);
        }
        setModalOpen(false);
        return;
      }

      const created = await createClient.mutateAsync(payload);
      if (cinUploads?.front || cinUploads?.back) {
        await attachClientCinDocuments(created.id, cinUploads);
      }
      setModalOpen(false);
      toast.success(
        (t) => (
          <span className="flex items-center gap-3">
            Client créé
            <Link
              href={`/clients/${created.id}`}
              className="font-medium text-accent underline"
              onClick={() => toast.dismiss(t.id)}
            >
              Ouvrir le client
            </Link>
          </span>
        ),
        { duration: 5000 }
      );
    } catch {
      /* mutation toasts */
    }
  };

  return (
    <div className={clientsListPage}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-app-primary sm:text-2xl">
            <span className={accentBar} aria-hidden />
            Clients
          </h1>
          <p className="mt-0.5 text-xs text-glass-muted sm:text-sm">
            Gérez vos clients et leurs projets
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="hidden h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-glass bg-[color:var(--glass-bg-hover)] px-4 text-sm font-medium text-glass shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          Nouveau client
        </button>
      </div>

      <div
        className={cn(
          clientsListPanel,
          (filterOpen || sortOpen) && "relative z-40"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-glass bg-[color:var(--glass-bg-hover)] text-glass shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light sm:hidden"
            aria-label="Nouveau client"
          >
            <Plus className="h-4 w-4" />
          </button>

          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-glass-muted"
              strokeWidth={1.75}
            />
            <input
              type="search"
              placeholder="Rechercher nom, entreprise, email, téléphone, ville…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(glassInput, "h-9 py-0 pl-9 pr-3 text-[13px]")}
              aria-label="Rechercher des clients"
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
                aria-label="Filtrer les clients"
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
                  aria-label="Filtres des clients"
                  className={cn(
                    glassDropdownPlain,
                    "absolute left-0 top-full z-50 mt-1.5 w-[min(240px,calc(100vw-2rem))] max-h-[min(70vh,420px)] overflow-y-auto sm:left-auto sm:right-0"
                  )}
                >
                <p className={dropdownSectionLabel}>Statut</p>
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={cn(
                      dropdownItem,
                      statusFilter === f.id ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}

                <p className={cn(dropdownSectionLabel, "mt-1")}>Type de client</p>
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

                <p className={cn(dropdownSectionLabel, "mt-1")}>Projets</p>
                {RELATION_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setRelationFilter(f.id)}
                    className={cn(
                      dropdownItem,
                      relationFilter === f.id ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}

                <p className={cn(dropdownSectionLabel, "mt-1")}>Finance</p>
                {FINANCE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFinanceFilter(f.id)}
                    className={cn(
                      dropdownItem,
                      financeFilter === f.id ? dropdownItemActive : dropdownItemInactive
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
                    className={cn(dropdownItem, "mt-1 text-glass-muted hover:text-glass-secondary")}
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
                aria-label="Trier les clients"
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
                  aria-label="Trier les clients"
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

            <div className="flex rounded-lg border border-glass bg-[color:var(--glass-bg)] p-0.5">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "rounded-md p-2 transition",
                  view === "grid"
                    ? "bg-studio-muted text-studio-light"
                    : "text-glass-muted hover:text-glass-secondary"
                )}
                aria-label="Vue grille"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={cn(
                  "rounded-md p-2 transition",
                  view === "list"
                    ? "bg-studio-muted text-studio-light"
                    : "text-glass-muted hover:text-glass-secondary"
                )}
                aria-label="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-studio-light/40 border-t-studio-light" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Users}
          title="Erreur de chargement"
          description="Impossible de charger les clients."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client"
          description="Ajoutez votre premier client pour commencer."
          actionLabel="Nouveau client"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun résultat"
          description={
            hasActiveFilters
              ? "Aucun client ne correspond à votre recherche ou vos filtres."
              : "Aucun client trouvé."
          }
          actionLabel="Réinitialiser les filtres"
          onAction={resetFilters}
        />
      ) : view === "grid" ? (
        <div className={clientsListGrid}>
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} onEdit={openEdit} />
          ))}
        </div>
      ) : (
        <div className={clientsListTable}>
          <ClientListHeader />
          {filtered.map((client) => (
            <ClientListRow key={client.id} client={client} onEdit={openEdit} />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? "Modifier le client" : "Nouveau client"}
        size="lg"
        variant="glass"
      >
        <ClientForm
          initial={editingClient}
          onSubmit={handleSubmit}
          loading={createClient.isPending || updateClient.isPending}
          submitLabel={editingClient ? "Enregistrer" : "Créer le client"}
        />
      </Modal>
    </div>
  );
}
