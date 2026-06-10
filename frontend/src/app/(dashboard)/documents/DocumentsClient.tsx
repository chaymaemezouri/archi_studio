"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  FileText,
  Grid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import DocumentForm, { type DocumentFormValues } from "@/components/documents/DocumentForm";
import DocumentPreviewModal from "@/components/documents/DocumentPreviewModal";
import DocumentProjectSection from "@/components/documents/DocumentProjectSection";
import {
  documentsListPage,
  documentsListPanel,
} from "@/components/documents/documents-list-ui";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useDocuments,
  useUpdateDocument,
  useUploadDocument,
} from "@/hooks/useDocuments";
import { useProjects } from "@/hooks/useProjects";
import {
  filterAndSortDocuments,
  groupDocumentsByProject,
  type DocumentCategoryFilter,
  type DocumentDateFilter,
  type DocumentLinkFilter,
  type DocumentSort,
  type DocumentTypeFilter,
} from "@/lib/documents-list";
import type { Document } from "@/types";
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

const VIEW_STORAGE_KEY = "documents-list-view";

const TYPE_FILTERS: { id: DocumentTypeFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "PDF", label: "PDF" },
  { id: "DOCX", label: "DOCX" },
  { id: "DWG", label: "DWG" },
  { id: "IMAGE", label: "Image" },
  { id: "OTHER", label: "Autre" },
];

const CATEGORY_FILTERS: { id: DocumentCategoryFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "CONTRACT", label: "Contrat" },
  { id: "AUTHORIZATION", label: "Autorisation" },
  { id: "CPS", label: "CPS" },
  { id: "BPU", label: "BPU" },
  { id: "ADMIN", label: "Administratif" },
  { id: "CLIENT_DOC", label: "Document client" },
  { id: "PROJECT_DOC", label: "Document projet" },
  { id: "OTHER", label: "Autre" },
];

const LINK_FILTERS: { id: DocumentLinkFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "project", label: "Liés à un projet" },
  { id: "client", label: "Liés à un client" },
  { id: "unclassified", label: "Non classés" },
];

const DATE_FILTERS: { id: DocumentDateFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "recent", label: "Récents" },
  { id: "month", label: "Ce mois" },
  { id: "year", label: "Cette année" },
];

const SORT_OPTIONS: { id: DocumentSort; label: string }[] = [
  { id: "recent", label: "Plus récents" },
  { id: "oldest", label: "Plus anciens" },
  { id: "name_asc", label: "Nom A-Z" },
  { id: "name_desc", label: "Nom Z-A" },
  { id: "size", label: "Taille du fichier" },
  { id: "type", label: "Type de fichier" },
];

export default function DocumentsPage() {
  const { data: documents = [], isLoading, isError, refetch } = useDocuments();
  const { data: projects = [] } = useProjects();
  const uploadDocument = useUploadDocument();
  const updateDocument = useUpdateDocument();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [typeFilter, setTypeFilter] = useState<DocumentTypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategoryFilter>("all");
  const [linkFilter, setLinkFilter] = useState<DocumentLinkFilter>("all");
  const [dateFilter, setDateFilter] = useState<DocumentDateFilter>("all");
  const [sort, setSort] = useState<DocumentSort>("recent");
  const [view, setView] = useState<"list" | "grid">("list");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === "list" || stored === "grid") setView(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingDoc(null);
      setModalOpen(true);
      router.replace("/documents", { scroll: false });
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
    setTypeFilter("all");
    setCategoryFilter("all");
    setLinkFilter("all");
    setDateFilter("all");
  }, []);

  const filtered = useMemo(
    () =>
      filterAndSortDocuments(documents, {
        query: debouncedSearch,
        typeFilter,
        categoryFilter,
        linkFilter,
        dateFilter,
        sort,
      }),
    [
      documents,
      debouncedSearch,
      typeFilter,
      categoryFilter,
      linkFilter,
      dateFilter,
      sort,
    ]
  );

  const projectGroups = useMemo(
    () => groupDocumentsByProject(filtered, sort),
    [filtered, sort]
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    linkFilter !== "all" ||
    dateFilter !== "all";

  const openCreate = () => {
    setEditingDoc(null);
    setModalOpen(true);
  };

  const openEdit = (doc: Document) => {
    setEditingDoc(doc);
    setModalOpen(true);
  };

  const projectOptions = useMemo(
    () => projects.map((p) => ({ id: p.id, name: p.name })),
    [projects]
  );

  const handleLinkProject = useCallback(
    (doc: Document, projectId: string) => {
      updateDocument.mutate({ id: doc.id, projectId });
    },
    [updateDocument]
  );

  const handleSubmit = (values: DocumentFormValues) => {
    const tags = values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingDoc) {
      updateDocument.mutate(
        {
          id: editingDoc.id,
          name: values.name.trim(),
          category: values.category,
          projectId: values.projectId || null,
          clientId: values.clientId || null,
          tags,
          description: values.description.trim() || undefined,
        },
        { onSuccess: () => setModalOpen(false) }
      );
      return;
    }

    if (!values.file) return;

    uploadDocument.mutate(
      {
        file: values.file,
        name: values.name.trim(),
        category: values.category,
        projectId: values.projectId || undefined,
        clientId: values.clientId || undefined,
        tags,
        description: values.description.trim() || undefined,
      },
      { onSuccess: () => setModalOpen(false) }
    );
  };

  const emptyMessage =
    linkFilter === "unclassified" && !hasActiveFilters
      ? "Tous vos documents sont classés"
      : hasActiveFilters
        ? "Aucun document ne correspond à votre recherche"
        : "Aucun document dans cette catégorie";

  return (
    <div className={documentsListPage}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-app-primary sm:text-2xl">
            <span className={accentBar} aria-hidden />
            Documents
          </h1>
          <p className="mt-0.5 text-xs text-glass-muted sm:text-sm">
            Centralisez vos fichiers, contrats et documents de projet
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="hidden h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-app bg-[color:var(--glass-bg)] px-4 text-sm font-medium text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light sm:inline-flex"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Ajouter un document
        </button>
      </div>

      <div
        className={cn(
          documentsListPanel,
          (filterOpen || sortOpen) && "relative z-40"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-app bg-[color:var(--glass-bg)] text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light sm:hidden"
            aria-label="Ajouter un document"
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
              placeholder="Rechercher un document, projet ou client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(glassInput, "h-9 py-0 pl-9 pr-3 text-[13px]")}
              aria-label="Rechercher des documents"
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
                aria-label="Filtrer les documents"
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
                  aria-label="Filtres des documents"
                  className={cn(
                    glassDropdownPlain,
                    "absolute left-0 top-full z-50 mt-1.5 w-[min(240px,calc(100vw-2rem))] max-h-[min(70vh,420px)] overflow-y-auto sm:left-auto sm:right-0"
                  )}
                >
                <p className={dropdownSectionLabel}>Type de fichier</p>
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

                <p className={cn(dropdownSectionLabel, "mt-1")}>Catégorie</p>
                {CATEGORY_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCategoryFilter(f.id)}
                    className={cn(
                      dropdownItem,
                      categoryFilter === f.id ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}

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

                <p className={cn(dropdownSectionLabel, "mt-1")}>Date</p>
                {DATE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setDateFilter(f.id)}
                    className={cn(
                      dropdownItem,
                      dateFilter === f.id ? dropdownItemActive : dropdownItemInactive
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
                aria-label="Trier les documents"
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
                  aria-label="Trier les documents"
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
          icon={FileText}
          title="Erreur de chargement"
          description="Impossible de charger les documents."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun document ajouté"
          description="Ajoutez votre premier document pour commencer."
          actionLabel="Ajouter un document"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun résultat"
          description={emptyMessage}
          actionLabel="Réinitialiser les filtres"
          onAction={resetFilters}
        />
      ) : (
        <div className="space-y-3">
          {projectGroups.map((group) => (
            <DocumentProjectSection
              key={group.key}
              group={group}
              view={view}
              onEdit={openEdit}
              onPreview={setPreviewDoc}
              projects={projectOptions}
              onLinkProject={handleLinkProject}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDoc(null);
        }}
        title={editingDoc ? "Modifier le document" : "Ajouter un document"}
        size="lg"
        variant="glass"
      >
        <DocumentForm
          initial={editingDoc}
          onSubmit={handleSubmit}
          loading={uploadDocument.isPending || updateDocument.isPending}
          submitLabel={editingDoc ? "Enregistrer" : "Ajouter"}
        />
      </Modal>

      <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}
