"use client";



import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import {

  ChevronDown,

  FolderKanban,

  LayoutGrid,

  List,

  Plus,

  Search,

  SlidersHorizontal,

} from "lucide-react";

import CreateProjectDrawer from "@/components/projects/CreateProjectDrawer";

import ProjectCard from "@/components/projects/ProjectCard";

import ProjectListRow, { ProjectListHeader } from "@/components/projects/ProjectListRow";

import ProjectsPagination from "@/components/projects/ProjectsPagination";

import type { ProjectMenuQuickAdd } from "@/components/projects/ProjectCardMenu";

import ProjectQuickAddSheet from "@/components/projects/detail/ProjectQuickAddSheet";

import EmptyState from "@/components/ui/EmptyState";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import {

  getProjectsPageSize,

  useProjectsBreakpoint,

} from "@/hooks/useProjectsPageSize";

import { useProjects } from "@/hooks/useProjects";

import { getNextTaskForProject } from "@/lib/project-status";

import { canCreateProject } from "@/lib/permissions";

import { useAuthStore } from "@/store/authStore";

import { PHASE_LABELS, type Project, type ProjectCategory, type ProjectPhase, type ProjectScale } from "@/types";

import {
  ALL_FILTER_PHASES,
  PROJECT_CATEGORY_LABELS,
  PROJECT_NATURE_OPTIONS,
  PROJECT_SCALE_LABELS,
} from "@/lib/project-phases";

import {
  applyProjectsCategoryFilter,
  applyProjectsMainFilter,
  applyProjectsNatureFilter,
  applyProjectsPhaseFilter,
  applyProjectsScaleFilter,
  searchProjects,
  sortProjects,
  type ProjectsMainFilter,
  type ProjectsSort,
} from "@/lib/projects-list";
import { getInitialProjectsView } from "@/lib/settings-user-prefs";

import {

  accentBar,

  dropdownItem,

  dropdownItemActive,

  dropdownItemInactive,

  dropdownSectionLabel,

  glassDropdownPlain,

  glassPanel,

  glassBtnIcon,

  glassInput,

} from "@/lib/glass-styles";

import {
  projectListTableInner,
  projectListTableWrap,
} from "@/components/projects/card/project-card-styles";

import { cn } from "@/lib/utils";



const VIEW_STORAGE_KEY = "projects-list-view";



const MAIN_FILTERS: { id: ProjectsMainFilter; label: string }[] = [

  { id: "all", label: "Tous" },

  { id: "shared", label: "Communs" },

  { id: "personal", label: "Personnels" },

  { id: "favorites", label: "Favoris" },

  { id: "urgent", label: "Urgents" },

  { id: "overdue", label: "En retard" },

  { id: "recent", label: "Récents" },

  { id: "archived", label: "Archivés" },

];



const PHASE_FILTERS = ALL_FILTER_PHASES.map((id) => ({
  id,
  label: PHASE_LABELS[id],
}));



const SORT_OPTIONS: { id: ProjectsSort; label: string }[] = [

  { id: "updated", label: "Plus récents" },

  { id: "updated_asc", label: "Plus anciens" },

  { id: "name", label: "Nom A–Z" },

  { id: "name_desc", label: "Nom Z–A" },

  { id: "deadline", label: "Deadline proche" },

  { id: "deadline_desc", label: "Deadline lointaine" },

  { id: "progress", label: "Progression élevée" },

  { id: "progress_asc", label: "Progression faible" },

  { id: "activity", label: "Dernière activité" },

];



export default function ProjectsPage() {

  const { data: projects = [], isLoading, isError, refetch } = useProjects();

  const user = useAuthStore((s) => s.user);

  const searchParams = useSearchParams();

  const router = useRouter();

  const breakpoint = useProjectsBreakpoint();



  const [drawerOpen, setDrawerOpen] = useState(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);

  const [mainFilter, setMainFilter] = useState<ProjectsMainFilter>("all");

  const [phaseFilter, setPhaseFilter] = useState<ProjectPhase | null>(null);

  const [scaleFilter, setScaleFilter] = useState<ProjectScale | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | null>(null);

  const [natureFilter, setNatureFilter] = useState<string | null>(null);

  const [sort, setSort] = useState<ProjectsSort>("updated");

  const [view, setView] = useState<"grid" | "list">("grid");

  const [page, setPage] = useState(1);

  const [defaultClientId, setDefaultClientId] = useState<string | undefined>();

  const [quickAdd, setQuickAdd] = useState<{

    projectId: string;

    mode: ProjectMenuQuickAdd;

  } | null>(null);

  const [sortOpen, setSortOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  const listTopRef = useRef<HTMLDivElement>(null);



  const pageSize = getProjectsPageSize(view, breakpoint);



  useEffect(() => {
    setView(getInitialProjectsView());
  }, []);



  useEffect(() => {

    localStorage.setItem(VIEW_STORAGE_KEY, view);

  }, [view]);



  useEffect(() => {

    if (!sortOpen) return;

    const close = (e: MouseEvent) => {

      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);

    };

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);

  }, [sortOpen]);



  useEffect(() => {

    if (!filterOpen) return;

    const close = (e: MouseEvent) => {

      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);

    };

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);

  }, [filterOpen]);



  useEffect(() => {

    if (searchParams.get("new") === "1") {

      setEditingProject(null);

      setDrawerOpen(true);

      const clientId = searchParams.get("clientId");

      setDefaultClientId(clientId ?? undefined);

      if (clientId) {

        router.replace(`/projects?clientId=${clientId}`, { scroll: false });

      } else {

        router.replace("/projects", { scroll: false });

      }

    }

  }, [searchParams, router]);



  useEffect(() => {

    setPage(1);

  }, [mainFilter, phaseFilter, scaleFilter, categoryFilter, natureFilter, sort, debouncedSearch, view, pageSize]);



  const openCreate = () => {

    setEditingProject(null);

    setDrawerOpen(true);

  };



  const openEdit = (project: Project) => {

    setEditingProject(project);

    setDrawerOpen(true);

  };



  const closeDrawer = () => {

    setDrawerOpen(false);

    setEditingProject(null);

  };



  const resetFilters = useCallback(() => {

    setMainFilter("all");

    setPhaseFilter(null);

    setScaleFilter(null);

    setCategoryFilter(null);

    setNatureFilter(null);

    setSearch("");

  }, []);



  const hasActiveFilters =
    mainFilter !== "all" ||
    phaseFilter !== null ||
    scaleFilter !== null ||
    categoryFilter !== null ||
    natureFilter !== null;

  const hasSearch = debouncedSearch.trim() !== "";



  const allTasks = useMemo(() => {

    const tasks = projects.flatMap((p) => p.tasks ?? []);

    const map = new Map(tasks.map((t) => [t.id, t]));

    return Array.from(map.values());

  }, [projects]);



  const filtered = useMemo(() => {

    let list = applyProjectsMainFilter(projects, mainFilter);

    list = applyProjectsPhaseFilter(list, phaseFilter);

    list = applyProjectsScaleFilter(list, scaleFilter);

    list = applyProjectsCategoryFilter(list, categoryFilter);

    list = applyProjectsNatureFilter(list, natureFilter);

    list = searchProjects(list, debouncedSearch);

    return sortProjects(list, sort);

  }, [projects, mainFilter, phaseFilter, scaleFilter, categoryFilter, natureFilter, debouncedSearch, sort]);



  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const safePage = Math.min(page, totalPages);



  useEffect(() => {

    if (page > totalPages) setPage(totalPages);

  }, [page, totalPages]);



  const paginated = useMemo(() => {

    const start = (safePage - 1) * pageSize;

    return filtered.slice(start, start + pageSize);

  }, [filtered, safePage, pageSize]);



  const handlePageChange = useCallback((next: number) => {

    setPage(next);

    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  }, []);



  const hasProjects = projects.length > 0;

  const noResults = !isLoading && hasProjects && filtered.length === 0;

  const canCreate = canCreateProject(user);



  const handleQuickAdd = (mode: ProjectMenuQuickAdd, project: Project) => {

    setQuickAdd({ projectId: project.id, mode });

  };



  const noResultsDescription = hasSearch

    ? "Ajustez votre recherche ou réinitialisez les filtres."

    : "Modifiez les filtres pour afficher d'autres projets.";



  const noResultsTitle = hasSearch

    ? "Aucun projet ne correspond à votre recherche"

    : "Aucun résultat";



  return (

    <div className="space-y-3 pb-2">

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">

        <div className="min-w-0">

          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-app-primary sm:text-2xl">

            <span className={accentBar} aria-hidden />

            Projets

          </h1>

          <p className="mt-0.5 text-xs text-glass-muted sm:text-sm">

            Gérez vos projets, suivez les phases et les deadlines

          </p>

        </div>



        {canCreate && (

          <button

            type="button"

            onClick={openCreate}

            className="hidden h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-glass bg-[color:var(--glass-bg-hover)] px-4 text-sm font-medium text-glass shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light sm:inline-flex"

          >

          <Plus className="h-4 w-4" />

          Nouveau projet

          </button>

        )}

      </div>



      <div

        className={cn(

          "flex items-center gap-1.5 sm:gap-2",

          (filterOpen || sortOpen) && "relative z-40"

        )}

      >

        {canCreate && (

          <button

            type="button"

            onClick={openCreate}

            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-glass bg-[color:var(--glass-bg-hover)] text-glass shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light sm:hidden"

            aria-label="Nouveau projet"

          >

            <Plus className="h-4 w-4" />

          </button>

        )}

        <div className="relative min-w-0 flex-1 sm:max-w-md">

          <Search

            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-glass-muted"

            strokeWidth={1.75}

          />

          <input

            type="search"

            placeholder="Rechercher projet, client, ville…"

            value={search}

            onChange={(e) => setSearch(e.target.value)}

            className={cn(glassInput, "h-9 py-0 pl-9 pr-3 text-[13px]")}

            aria-label="Rechercher des projets"

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

              aria-label="Filtrer les projets"

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

                aria-label="Filtres des projets"

                className={cn(

                  glassDropdownPlain,

                  "absolute left-0 top-full z-50 mt-1.5 w-[min(220px,calc(100vw-2rem))] sm:left-auto sm:right-0"

                )}

              >

                <p className={dropdownSectionLabel}>Statut</p>

                {MAIN_FILTERS.map((f) => (

                  <button

                    key={f.id}

                    type="button"

                    onClick={() => setMainFilter(f.id)}

                    className={cn(

                      dropdownItem,

                      mainFilter === f.id ? dropdownItemActive : dropdownItemInactive

                    )}

                  >

                    {f.label}

                  </button>

                ))}



                <p className={cn(dropdownSectionLabel, "mt-1")}>Phase</p>

                <div className="max-h-[200px] overflow-y-auto">

                  <button

                    type="button"

                    onClick={() => setPhaseFilter(null)}

                    className={cn(

                      dropdownItem,

                      phaseFilter === null ? dropdownItemActive : dropdownItemInactive

                    )}

                  >

                    Toutes

                  </button>

                  {PHASE_FILTERS.map((f) => (

                    <button

                      key={f.id}

                      type="button"

                      onClick={() => setPhaseFilter(f.id)}

                      className={cn(

                        dropdownItem,

                        phaseFilter === f.id ? dropdownItemActive : dropdownItemInactive

                      )}

                    >

                      {f.label}

                    </button>

                  ))}

                </div>



                <p className={cn(dropdownSectionLabel, "mt-1")}>Taille</p>

                <button
                  type="button"
                  onClick={() => setScaleFilter(null)}
                  className={cn(
                    dropdownItem,
                    scaleFilter === null ? dropdownItemActive : dropdownItemInactive
                  )}
                >
                  Toutes
                </button>
                {(Object.entries(PROJECT_SCALE_LABELS) as [ProjectScale, string][]).map(
                  ([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setScaleFilter(id)}
                      className={cn(
                        dropdownItem,
                        scaleFilter === id ? dropdownItemActive : dropdownItemInactive
                      )}
                    >
                      {label}
                    </button>
                  )
                )}

                <p className={cn(dropdownSectionLabel, "mt-1")}>Catégorie</p>

                <button
                  type="button"
                  onClick={() => setCategoryFilter(null)}
                  className={cn(
                    dropdownItem,
                    categoryFilter === null ? dropdownItemActive : dropdownItemInactive
                  )}
                >
                  Toutes
                </button>
                {(Object.entries(PROJECT_CATEGORY_LABELS) as [ProjectCategory, string][]).map(
                  ([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCategoryFilter(id)}
                      className={cn(
                        dropdownItem,
                        categoryFilter === id ? dropdownItemActive : dropdownItemInactive
                      )}
                    >
                      {label}
                    </button>
                  )
                )}

                <p className={cn(dropdownSectionLabel, "mt-1")}>Nature</p>

                <button
                  type="button"
                  onClick={() => setNatureFilter(null)}
                  className={cn(
                    dropdownItem,
                    natureFilter === null ? dropdownItemActive : dropdownItemInactive
                  )}
                >
                  Toutes
                </button>
                {PROJECT_NATURE_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNatureFilter(n)}
                    className={cn(
                      dropdownItem,
                      natureFilter === n ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {n}
                  </button>
                ))}



                {(hasActiveFilters || hasSearch) && (

                  <button

                    type="button"

                    onClick={() => {

                      resetFilters();

                      setFilterOpen(false);

                    }}

                    className={cn(dropdownItem, dropdownItemInactive, "mt-1 text-[12px]")}

                  >

                    Réinitialiser

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

              aria-label="Trier les projets"

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

                aria-label="Trier les projets"

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



      <div ref={listTopRef} />



      {isLoading ? (

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {Array.from({ length: pageSize }).map((_, i) => (

            <div

              key={i}

              className="h-[210px] animate-pulse rounded-xl border border-app bg-[color:var(--glass-bg)]"

            />

          ))}

        </div>

      ) : isError ? (

          <EmptyState

            icon={FolderKanban}

            title="Impossible de charger les projets"

            description="Vérifiez votre connexion ou réessayez dans quelques instants."

            actionLabel="Réessayer"

            onAction={() => refetch()}

          />

      ) : !hasProjects ? (

          <EmptyState

            icon={FolderKanban}

            title="Aucun projet"

            description="Commencez par créer votre premier projet architectural."

            actionLabel={canCreate ? "Créer votre premier projet" : undefined}

            onAction={canCreate ? openCreate : undefined}

          />

      ) : noResults ? (

          <EmptyState

            icon={hasSearch ? Search : SlidersHorizontal}

            title={noResultsTitle}

            description={noResultsDescription}

            actionLabel="Réinitialiser les filtres"

            onAction={resetFilters}

          />

      ) : view === "grid" ? (

        <div className="space-y-4">

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {paginated.map((project) => (

              <ProjectCard

                key={project.id}

                project={project}

                nextTask={getNextTaskForProject(project.id, allTasks)}

                onEdit={openEdit}

                onQuickAdd={handleQuickAdd}

              />

            ))}

          </div>

          <ProjectsPagination

            page={safePage}

            pageSize={pageSize}

            totalItems={filtered.length}

            onPageChange={handlePageChange}

          />

        </div>

      ) : (

        <div className="space-y-3">

          <div className={projectListTableWrap}>

            <div className={projectListTableInner}>

              <ProjectListHeader />

              {paginated.map((project) => (

                <ProjectListRow

                  key={project.id}

                  project={project}

                  onEdit={openEdit}

                  onQuickAdd={handleQuickAdd}

                />

              ))}

            </div>

          </div>

          <ProjectsPagination

            page={safePage}

            pageSize={pageSize}

            totalItems={filtered.length}

            onPageChange={handlePageChange}

          />

        </div>

      )}



      <CreateProjectDrawer

        isOpen={drawerOpen}

        onClose={closeDrawer}

        project={editingProject}

        defaultClientId={defaultClientId}

      />



      {quickAdd && (

        <ProjectQuickAddSheet

          open

          onClose={() => setQuickAdd(null)}

          projectId={quickAdd.projectId}

          mode={quickAdd.mode}

        />

      )}

    </div>

  );

}


