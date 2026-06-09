"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckSquare,
  ChevronDown,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import TaskBoardView from "@/components/tasks/TaskBoardView";
import TaskForm from "@/components/tasks/TaskForm";
import TaskRow, { TaskListHeader } from "@/components/tasks/TaskRow";
import {
  tasksListPage,
  tasksListPanel,
  tasksListTable,
} from "@/components/tasks/tasks-list-ui";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useCreateTask,
  useTasks,
  useUpdateTask,
} from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import {
  filterAndSortTasks,
  type TaskMainFilter,
  type TaskSort,
} from "@/lib/tasks-list";
import type { Priority, Task, TaskStatus } from "@/types";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import {
  accentBar,
  dropdownItem,
  dropdownItemActive,
  dropdownItemInactive,
  dropdownSectionLabel,
  glassBtnIcon,
  glassDropdownPlain,
  glassInput,
  glassSelect,
} from "@/lib/glass-styles";
import {
  getInitialTasksShowDone,
  getInitialTasksView,
  VIEW_KEYS,
} from "@/lib/settings-user-prefs";
import { cn } from "@/lib/utils";

const VIEW_STORAGE_KEY = VIEW_KEYS.tasks;

const MAIN_FILTERS: { id: TaskMainFilter; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "today", label: "Aujourd'hui" },
  { id: "tomorrow", label: "Demain" },
  { id: "week", label: "Cette semaine" },
  { id: "overdue", label: "En retard" },
  { id: "urgent", label: "Urgentes" },
  { id: "done", label: "Terminées" },
];

const SORT_OPTIONS: { id: TaskSort; label: string }[] = [
  { id: "deadline", label: "Deadline proche" },
  { id: "recent", label: "Plus récentes" },
  { id: "oldest", label: "Plus anciennes" },
  { id: "priority", label: "Priorité élevée" },
  { id: "status", label: "Statut" },
];

export default function TasksPage() {
  const { data: tasks = [], isLoading, isError, refetch } = useTasks();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [mainFilter, setMainFilter] = useState<TaskMainFilter>("all");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string | "all" | "personal">("all");
  const [clientFilter, setClientFilter] = useState<string | "all">("all");
  const [sort, setSort] = useState<TaskSort>("deadline");
  const [view, setView] = useState<"list" | "board">("list");
  const [showDone, setShowDone] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setView(getInitialTasksView());
    setShowDone(getInitialTasksShowDone());
  }, []);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem(VIEW_KEYS.tasksShowDone, String(showDone));
  }, [showDone]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingTask(null);
      setModalOpen(true);
      router.replace("/tasks", { scroll: false });
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
    setMainFilter("all");
    setStatusFilter("all");
    setPriorityFilter("all");
    setProjectFilter("all");
    setClientFilter("all");
    setShowDone(false);
  }, []);

  const filtered = useMemo(
    () =>
      filterAndSortTasks(tasks, {
        query: debouncedSearch,
        mainFilter,
        statusFilter,
        priorityFilter,
        projectFilter,
        clientFilter,
        sort,
        showDone: showDone || mainFilter === "done",
      }),
    [
      tasks,
      debouncedSearch,
      mainFilter,
      statusFilter,
      priorityFilter,
      projectFilter,
      clientFilter,
      sort,
      showDone,
    ]
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    mainFilter !== "all" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    projectFilter !== "all" ||
    clientFilter !== "all" ||
    showDone;

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmit = (payload: Partial<Task>) => {
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, ...payload }, { onSuccess: () => setModalOpen(false) });
      return;
    }
    createTask.mutate(payload, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <div className={tasksListPage}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-app-primary sm:text-2xl">
            <span className={accentBar} aria-hidden />
            Tâches
          </h1>
          <p className="mt-0.5 text-xs text-glass-muted sm:text-sm">
            Suivez vos tâches, priorités et deadlines
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="hidden h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-app bg-[color:var(--glass-bg)] px-4 text-sm font-medium text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light sm:inline-flex"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Nouvelle tâche
        </button>
      </div>

      <div
        className={cn(
          tasksListPanel,
          (filterOpen || sortOpen) && "relative z-40"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-app bg-[color:var(--glass-bg)] text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light sm:hidden"
            aria-label="Nouvelle tâche"
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
              placeholder="Rechercher une tâche, un projet ou un client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(glassInput, "h-9 py-0 pl-9 pr-3 text-[13px]")}
              aria-label="Rechercher des tâches"
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
                aria-label="Filtrer les tâches"
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
                  aria-label="Filtres des tâches"
                  className={cn(
                    glassDropdownPlain,
                    "absolute left-0 top-full z-50 mt-1.5 w-[min(260px,calc(100vw-2rem))] max-h-[min(75vh,480px)] overflow-y-auto sm:left-auto sm:right-0"
                  )}
                >
                <p className={dropdownSectionLabel}>Période</p>
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

                <p className={cn(dropdownSectionLabel, "mt-1")}>Projet</p>
                <div className="px-2 pb-1">
                  <select
                    value={projectFilter}
                    onChange={(e) =>
                      setProjectFilter(e.target.value as string | "all" | "personal")
                    }
                    className={cn(glassSelect, "h-8 w-full py-0 text-[12px]")}
                    aria-label="Filtrer par projet"
                  >
                    <option value="all">Tous les projets</option>
                    <option value="personal">Personnelles</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <p className={cn(dropdownSectionLabel, "mt-1")}>Client</p>
                <div className="px-2 pb-1">
                  <select
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    className={cn(glassSelect, "h-8 w-full py-0 text-[12px]")}
                    aria-label="Filtrer par client"
                  >
                    <option value="all">Tous les clients</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <p className={cn(dropdownSectionLabel, "mt-1")}>Priorité</p>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("all")}
                  className={cn(
                    dropdownItem,
                    priorityFilter === "all" ? dropdownItemActive : dropdownItemInactive
                  )}
                >
                  Toutes
                </button>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPriorityFilter(value as Priority)}
                    className={cn(
                      dropdownItem,
                      priorityFilter === value ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {label}
                  </button>
                ))}

                <p className={cn(dropdownSectionLabel, "mt-1")}>Statut</p>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    dropdownItem,
                    statusFilter === "all" ? dropdownItemActive : dropdownItemInactive
                  )}
                >
                  Tous
                </button>
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value as TaskStatus)}
                    className={cn(
                      dropdownItem,
                      statusFilter === value ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {label}
                  </button>
                ))}

                <label className="mt-2 flex cursor-pointer items-center gap-2 border-t border-app px-3 py-2.5 text-[12px] text-glass-muted">
                  <input
                    type="checkbox"
                    checked={showDone}
                    onChange={(e) => setShowDone(e.target.checked)}
                    className="rounded border-[#8ba4c7]/[0.12] bg-[color:var(--glass-bg)] text-studio-light focus:ring-[#8ba4c7]/20"
                  />
                  Afficher terminées
                </label>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      resetFilters();
                      setFilterOpen(false);
                    }}
                    className={cn(dropdownItem, "text-glass-muted hover:text-glass-secondary")}
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
                aria-label="Trier les tâches"
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
                  aria-label="Trier les tâches"
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
                onClick={() => setView("board")}
                className={cn(
                  "rounded-md p-2 transition",
                  view === "board"
                    ? "bg-studio-muted text-studio-light"
                    : "text-glass-muted hover:text-glass-secondary"
                )}
                aria-label="Vue board"
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
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
          icon={CheckSquare}
          title="Erreur de chargement"
          description="Impossible de charger les tâches."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Aucune tâche créée"
          description="Créez votre première tâche pour commencer."
          actionLabel="Nouvelle tâche"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={hasActiveFilters ? "Aucun résultat" : "Aucune tâche dans cette catégorie"}
          description={
            hasActiveFilters
              ? "Aucune tâche ne correspond à votre recherche ou vos filtres."
              : "Essayez un autre filtre ou créez une nouvelle tâche."
          }
          actionLabel="Réinitialiser les filtres"
          onAction={resetFilters}
        />
      ) : view === "board" ? (
        <TaskBoardView tasks={filtered} onEdit={openEdit} />
      ) : (
        <div className={tasksListTable}>
          <TaskListHeader />
          {filtered.map((task) => (
            <TaskRow key={task.id} task={task} onEdit={openEdit} />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? "Modifier la tâche" : "Nouvelle tâche"}
        size="lg"
        variant="glass"
      >
        <TaskForm
          initial={editingTask}
          onSubmit={handleSubmit}
          loading={createTask.isPending || updateTask.isPending}
          submitLabel={editingTask ? "Enregistrer" : "Créer la tâche"}
        />
      </Modal>
    </div>
  );
}
