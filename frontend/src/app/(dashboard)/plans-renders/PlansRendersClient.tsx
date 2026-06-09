"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  Grid,
  Image as ImageIcon,
  Layers,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import PlanRenderForm, { type PlanRenderFormValues } from "@/components/plans-renders/PlanRenderForm";
import PlanRenderGridCard from "@/components/plans-renders/PlanRenderGridCard";
import PlanRenderPreviewModal from "@/components/plans-renders/PlanRenderPreviewModal";
import PlanRenderRow, { PlanRenderListHeader } from "@/components/plans-renders/PlanRenderRow";
import {
  plansRendersListPage,
  plansRendersListPanel,
  plansRendersListTable,
} from "@/components/plans-renders/plans-renders-list-ui";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  usePlansRenders,
  useUpdatePlanRender,
  useUploadPlanRender,
} from "@/hooks/usePlansRenders";
import {
  filterAndSortPlanRenders,
  type PlanRenderLinkFilter,
  type PlanRenderMainFilter,
  type PlanRenderSort,
} from "@/lib/plans-renders-list";
import type { PlanRender, PlanRenderKind } from "@/types";
import { PLAN_CATEGORY_LABELS, RENDER_CATEGORY_LABELS } from "@/types";
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
import { cn } from "@/lib/utils";

const VIEW_STORAGE_KEY = "plans-renders-view";

const MAIN_FILTERS: { id: PlanRenderMainFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "plans", label: "Plans" },
  { id: "renders", label: "Rendus" },
  { id: "unclassified", label: "Non classés" },
  { id: "recent", label: "Récents" },
  { id: "favorites", label: "Favoris" },
];

const LINK_FILTERS: { id: PlanRenderLinkFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "project", label: "Liés à un projet" },
  { id: "client", label: "Liés à un client" },
  { id: "unclassified", label: "Non classés" },
];

const SORT_OPTIONS: { id: PlanRenderSort; label: string }[] = [
  { id: "recent", label: "Plus récents" },
  { id: "oldest", label: "Plus anciens" },
  { id: "name_asc", label: "Nom A-Z" },
  { id: "name_desc", label: "Nom Z-A" },
  { id: "type", label: "Type" },
  { id: "project", label: "Projet" },
  { id: "size", label: "Taille du fichier" },
];

export default function PlansRendersPage() {
  const { data: assets = [], isLoading, isError, refetch } = usePlansRenders();
  const uploadAsset = useUploadPlanRender();
  const updateAsset = useUpdatePlanRender();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<PlanRenderKind>("PLAN");
  const [editing, setEditing] = useState<PlanRender | null>(null);
  const [preview, setPreview] = useState<PlanRender | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [mainFilter, setMainFilter] = useState<PlanRenderMainFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [linkFilter, setLinkFilter] = useState<PlanRenderLinkFilter>("all");
  const [sort, setSort] = useState<PlanRenderSort>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const addToolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === "grid" || stored === "list") setView(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  const openCreate = useCallback((kind: PlanRenderKind) => {
    setEditing(null);
    setModalKind(kind);
    setModalOpen(true);
    setAddMenuOpen(false);
  }, []);

  useEffect(() => {
    const kind = searchParams.get("new");
    if (kind === "plan" || kind === "render") {
      openCreate(kind === "plan" ? "PLAN" : "RENDER");
      router.replace("/plans-renders", { scroll: false });
    }
  }, [searchParams, router, openCreate]);

  useEffect(() => {
    if (!addMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (addRef.current?.contains(target) || addToolbarRef.current?.contains(target)) return;
      setAddMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [addMenuOpen]);

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

  const categoryOptions = useMemo(() => {
    if (mainFilter === "plans") return Object.entries(PLAN_CATEGORY_LABELS);
    if (mainFilter === "renders") return Object.entries(RENDER_CATEGORY_LABELS);
    return [];
  }, [mainFilter]);

  const filtered = useMemo(
    () =>
      filterAndSortPlanRenders(assets, {
        query: debouncedSearch,
        mainFilter,
        categoryFilter,
        linkFilter,
        sort,
      }),
    [assets, debouncedSearch, mainFilter, categoryFilter, linkFilter, sort]
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    mainFilter !== "all" ||
    categoryFilter !== "all" ||
    linkFilter !== "all";

  const resetFilters = useCallback(() => {
    setSearch("");
    setMainFilter("all");
    setCategoryFilter("all");
    setLinkFilter("all");
  }, []);

  const openEdit = (asset: PlanRender) => {
    setEditing(asset);
    setModalKind(asset.kind);
    setModalOpen(true);
  };

  const handleSubmit = (values: PlanRenderFormValues) => {
    const tags = values.tags.split(",").map((t) => t.trim()).filter(Boolean);

    if (editing) {
      updateAsset.mutate(
        {
          id: editing.id,
          name: values.name.trim(),
          category: values.category,
          projectId: values.projectId || null,
          clientId: values.clientId || null,
          version: values.version.trim() || undefined,
          tags,
          description: values.description.trim() || undefined,
          isMainImage: values.isMainImage,
        },
        { onSuccess: () => setModalOpen(false) }
      );
      return;
    }

    if (!values.file) return;

    uploadAsset.mutate(
      {
        file: values.file,
        kind: modalKind,
        category: values.category,
        name: values.name.trim(),
        projectId: values.projectId || undefined,
        clientId: values.clientId || undefined,
        version: values.version.trim() || undefined,
        tags,
        description: values.description.trim() || undefined,
        isMainImage: values.isMainImage,
      },
      { onSuccess: () => setModalOpen(false) }
    );
  };

  const emptyMessage =
    mainFilter === "unclassified" && !hasActiveFilters
      ? "Tous vos plans et rendus sont classés"
      : hasActiveFilters
        ? "Aucun élément ne correspond à votre recherche"
        : "Aucun élément dans cette catégorie";

  return (
    <div className={plansRendersListPage}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-app-primary sm:text-2xl">
            <span className={accentBar} aria-hidden />
            Plans & Rendus
          </h1>
          <p className="mt-0.5 text-xs text-glass-muted sm:text-sm">
            Centralisez vos plans, coupes, façades et rendus de projets
          </p>
        </div>

        <div
          ref={addRef}
          className={cn("relative hidden shrink-0 sm:block", addMenuOpen && "z-40")}
        >
          <button
            type="button"
            onClick={() => {
              setAddMenuOpen((v) => !v);
              setFilterOpen(false);
              setSortOpen(false);
            }}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-app bg-[color:var(--glass-bg)] px-4 text-sm font-medium text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light"
            aria-expanded={addMenuOpen}
            aria-haspopup="menu"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Ajouter
          </button>
          {addMenuOpen && (
            <div
              role="menu"
              className={cn(glassMenu, "absolute right-0 top-full z-50 mt-1.5 w-48 py-1")}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => openCreate("PLAN")}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
              >
                <Layers className="h-4 w-4" strokeWidth={1.75} /> Ajouter un plan
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => openCreate("RENDER")}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
              >
                <ImageIcon className="h-4 w-4" strokeWidth={1.75} /> Ajouter un rendu
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          plansRendersListPanel,
          (filterOpen || sortOpen || addMenuOpen) && "relative z-40"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            ref={addToolbarRef}
            className={cn("relative shrink-0 sm:hidden", addMenuOpen && "z-40")}
          >
            <button
              type="button"
              onClick={() => {
                setAddMenuOpen((v) => !v);
                setFilterOpen(false);
                setSortOpen(false);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app bg-[color:var(--glass-bg)] text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light"
              aria-label="Ajouter"
              aria-expanded={addMenuOpen}
              aria-haspopup="menu"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </button>
            {addMenuOpen && (
              <div
                role="menu"
                className={cn(glassMenu, "absolute left-0 top-full z-50 mt-1.5 w-48 py-1")}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openCreate("PLAN")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
                >
                  <Layers className="h-4 w-4" strokeWidth={1.75} /> Ajouter un plan
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openCreate("RENDER")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
                >
                  <ImageIcon className="h-4 w-4" strokeWidth={1.75} /> Ajouter un rendu
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
              placeholder="Rechercher un plan, rendu, projet ou client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(glassInput, "h-9 py-0 pl-9 pr-3 text-[13px]")}
              aria-label="Rechercher des plans et rendus"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setFilterOpen((v) => !v);
                  setSortOpen(false);
                  setAddMenuOpen(false);
                }}
                className={cn(
                  glassBtnIcon,
                  "relative h-9 w-9 shrink-0 px-0 sm:w-auto sm:gap-1.5 sm:px-3",
                  (filterOpen || hasActiveFilters) &&
                    "border-studio-border/40 bg-studio-soft text-studio-light"
                )}
                aria-label="Filtrer les plans et rendus"
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
                  aria-label="Filtres plans et rendus"
                  className={cn(
                    glassDropdownPlain,
                    "absolute left-0 top-full z-50 mt-1.5 w-[min(240px,calc(100vw-2rem))] max-h-[min(70vh,420px)] overflow-y-auto sm:left-auto sm:right-0"
                  )}
                >
                <p className={dropdownSectionLabel}>Type</p>
                {MAIN_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setMainFilter(f.id);
                      setCategoryFilter("all");
                    }}
                    className={cn(
                      dropdownItem,
                      mainFilter === f.id ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}

                {categoryOptions.length > 0 && (
                  <>
                    <p className={cn(dropdownSectionLabel, "mt-1")}>Catégorie</p>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("all")}
                      className={cn(
                        dropdownItem,
                        categoryFilter === "all" ? dropdownItemActive : dropdownItemInactive
                      )}
                    >
                      Toutes catégories
                    </button>
                    {categoryOptions.map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCategoryFilter(value)}
                        className={cn(
                          dropdownItem,
                          categoryFilter === value ? dropdownItemActive : dropdownItemInactive
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </>
                )}

                <p className={cn(dropdownSectionLabel, "mt-1")}>Lien</p>
                {LINK_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLinkFilter(f.id)}
                    className={cn(
                      dropdownItem,
                      linkFilter === f.id ? dropdownItemActive : dropdownItemInactive
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
                  setAddMenuOpen(false);
                }}
                className={cn(
                  glassBtnIcon,
                  "h-9 w-9 shrink-0 px-0 sm:w-auto sm:gap-1 sm:px-2.5",
                  sortOpen && "border-studio-border/40 bg-studio-soft text-studio-light"
                )}
                aria-label="Trier les plans et rendus"
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
                  aria-label="Trier les plans et rendus"
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

            <div className="flex rounded-lg border border-app bg-[color:var(--glass-bg)] p-0.5">
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
                <Grid className="h-4 w-4" strokeWidth={1.75} />
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
                <List className="h-4 w-4" strokeWidth={1.75} />
              </button>
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
          icon={Layers}
          title="Erreur de chargement"
          description="Impossible de charger les plans et rendus."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      ) : assets.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Aucun plan ou rendu ajouté"
          description="Ajoutez votre premier plan ou rendu pour commencer."
          actionLabel="Ajouter un plan"
          onAction={() => openCreate("PLAN")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Aucun résultat"
          description={emptyMessage}
          actionLabel="Réinitialiser les filtres"
          onAction={resetFilters}
        />
      ) : view === "list" ? (
        <div className={plansRendersListTable}>
          <PlanRenderListHeader />
          {filtered.map((asset) => (
            <PlanRenderRow
              key={asset.id}
              asset={asset}
              onEdit={openEdit}
              onPreview={setPreview}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((asset) => (
            <PlanRenderGridCard
              key={asset.id}
              asset={asset}
              onEdit={openEdit}
              onPreview={setPreview}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={
          editing
            ? "Modifier"
            : modalKind === "PLAN"
              ? "Ajouter un plan"
              : "Ajouter un rendu"
        }
        size="lg"
        variant="glass"
      >
        <PlanRenderForm
          kind={modalKind}
          initial={editing}
          onSubmit={handleSubmit}
          loading={uploadAsset.isPending || updateAsset.isPending}
          submitLabel={editing ? "Enregistrer" : "Ajouter"}
        />
      </Modal>

      <PlanRenderPreviewModal asset={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
