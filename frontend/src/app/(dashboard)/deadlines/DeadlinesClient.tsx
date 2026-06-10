"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import DeadlineProjectSection from "@/components/deadlines/DeadlineProjectSection";
import {
  deadlinesListPage,
  deadlinesListPanel,
} from "@/components/deadlines/deadlines-list-ui";
import EmptyState from "@/components/ui/EmptyState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDeadlines } from "@/hooks/useDeadlines";
import {
  filterAndSortDeadlines,
  groupDeadlinesByProject,
  type DeadlineFilter,
  type DeadlineSort,
} from "@/lib/deadlines-list";
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

const FILTER_OPTIONS: { id: DeadlineFilter; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "upcoming", label: "À venir" },
  { id: "today", label: "Aujourd'hui" },
  { id: "week", label: "Cette semaine" },
  { id: "overdue", label: "En retard" },
  { id: "done", label: "Terminées" },
];

const SORT_OPTIONS: { id: DeadlineSort; label: string }[] = [
  { id: "date", label: "Date proche" },
  { id: "priority", label: "Priorité élevée" },
  { id: "recent", label: "Plus récentes" },
];

export default function DeadlinesClient() {
  const { data: deadlines = [], isLoading, isError, refetch } = useDeadlines();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [filter, setFilter] = useState<DeadlineFilter>("upcoming");
  const [sort, setSort] = useState<DeadlineSort>("date");
  const [hideDone, setHideDone] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

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
    setFilter("upcoming");
    setSort("date");
    setHideDone(true);
  }, []);

  const filtered = useMemo(
    () =>
      filterAndSortDeadlines(deadlines, {
        query: debouncedSearch,
        filter,
        sort,
        hideDone: hideDone || filter === "done",
      }),
    [deadlines, debouncedSearch, filter, sort, hideDone]
  );

  const projectGroups = useMemo(
    () => groupDeadlinesByProject(filtered, sort),
    [filtered, sort]
  );

  const hasActiveFilters =
    search.trim() !== "" || filter !== "upcoming" || sort !== "date" || !hideDone;

  return (
    <div className={deadlinesListPage}>
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-app-primary sm:text-2xl">
          <span className={accentBar} aria-hidden />
          Deadlines
        </h1>
        <p className="mt-0.5 text-xs text-glass-muted sm:text-sm">
          Échéances importantes de vos projets
        </p>
      </div>

      <div
        className={cn(
          deadlinesListPanel,
          (filterOpen || sortOpen) && "relative z-40"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-glass-muted"
              strokeWidth={1.75}
            />
            <input
              type="search"
              placeholder="Rechercher une deadline ou un projet…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(glassInput, "h-9 py-0 pl-9 pr-3 text-[13px]")}
              aria-label="Rechercher des deadlines"
            />
          </div>

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
              aria-label="Filtrer les deadlines"
              aria-expanded={filterOpen}
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="hidden text-[13px] font-medium sm:inline">Filtres</span>
            </button>

            {filterOpen && (
              <div
                role="dialog"
                aria-label="Filtres deadlines"
                className={cn(
                  glassDropdownPlain,
                  "absolute right-0 top-full z-50 mt-1.5 w-[min(240px,calc(100vw-2rem))] sm:left-auto"
                )}
              >
                <p className={dropdownSectionLabel}>Période</p>
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      dropdownItem,
                      filter === f.id ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}
                <label className="mt-2 flex cursor-pointer items-center gap-2 border-t border-app px-3 py-2.5 text-[12px] text-glass-muted">
                  <input
                    type="checkbox"
                    checked={hideDone}
                    onChange={(e) => setHideDone(e.target.checked)}
                    className="rounded border-[#8ba4c7]/[0.12] bg-[color:var(--glass-bg)] text-studio-light focus:ring-[#8ba4c7]/20"
                  />
                  Masquer terminées
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
              aria-label="Trier les deadlines"
              aria-expanded={sortOpen}
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
                className={cn(
                  glassDropdownPlain,
                  "absolute right-0 top-full z-50 mt-1.5 min-w-[180px]"
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

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#8ba4c7]/30 border-t-[#8ba4c7]" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={CalendarClock}
          title="Erreur de chargement"
          description="Impossible de charger les deadlines."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      ) : deadlines.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Aucune deadline"
          description="Créez des deadlines depuis un projet ou le tableau de bord."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Aucun résultat"
          description="Aucune deadline ne correspond à vos critères."
          actionLabel="Réinitialiser les filtres"
          onAction={resetFilters}
        />
      ) : (
        <div className="space-y-3">
          {projectGroups.map((group) => (
            <DeadlineProjectSection key={group.key} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
