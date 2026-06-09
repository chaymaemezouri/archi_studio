"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { History, Search, SlidersHorizontal } from "lucide-react";
import ActivityRow from "@/components/activity/ActivityRow";
import {
  activityListPage,
  activityListPanel,
  activityListWrap,
} from "@/components/activity/activity-list-ui";
import EmptyState from "@/components/ui/EmptyState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useProjects } from "@/hooks/useProjects";
import {
  ACTIVITY_ENTITY_FILTERS,
  filterActivityLogs,
  type ActivityListFilters,
  type ActivityPeriodFilter,
  type ActivitySort,
} from "@/lib/activity-list";
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
import { cn } from "@/lib/utils";

const PERIOD_FILTERS: { id: ActivityPeriodFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "today", label: "Aujourd'hui" },
  { id: "week", label: "Cette semaine" },
  { id: "month", label: "Ce mois" },
  { id: "year", label: "Cette année" },
  { id: "custom", label: "Personnalisé" },
];

const SORT_OPTIONS: { id: ActivitySort; label: string }[] = [
  { id: "recent", label: "Plus récents" },
  { id: "oldest", label: "Plus anciens" },
];

export default function ActivityPage() {
  const searchParams = useSearchParams();
  const { data: logs = [], isLoading, isError, refetch } = useActivityLogs({ limit: 500 });
  const { data: projects = [] } = useProjects();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [period, setPeriod] = useState<ActivityPeriodFilter>("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [sort, setSort] = useState<ActivitySort>("recent");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (projectId) setProjectFilter(projectId);
  }, [searchParams]);

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

  const filters: ActivityListFilters = useMemo(
    () => ({
      query: debouncedSearch,
      period,
      customFrom,
      customTo,
      entity: entityFilter,
      projectId: projectFilter,
      sort,
    }),
    [debouncedSearch, period, customFrom, customTo, entityFilter, projectFilter, sort]
  );

  const filtered = useMemo(() => filterActivityLogs(logs, filters), [logs, filters]);

  const hasActiveFilters =
    search.trim() !== "" ||
    period !== "all" ||
    entityFilter !== "all" ||
    projectFilter !== "all";

  const resetFilters = useCallback(() => {
    setSearch("");
    setPeriod("all");
    setEntityFilter("all");
    setProjectFilter("all");
    setSort("recent");
    setCustomFrom("");
    setCustomTo("");
  }, []);

  return (
    <div className={activityListPage}>
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#e8edf4]/92 sm:text-2xl">
          <span className={accentBar} aria-hidden />
          Activité
        </h1>
        <p className="mt-0.5 text-xs text-[#8ba4c7]/45 sm:text-sm">
          Historique des actions sur vos projets, clients et documents
        </p>
      </div>

      <div className={cn(activityListPanel, filterOpen && "relative z-40")}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
              strokeWidth={1.75}
            />
            <input
              type="search"
              placeholder="Rechercher une action, un projet, un client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(glassInput, "h-9 py-0 pl-9 pr-3 text-[13px]")}
              aria-label="Rechercher dans l'activité"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ActivitySort)}
            className={cn(glassSelect, "h-9 py-0 text-[13px]")}
            aria-label="Tri"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>

          <div ref={filterRef} className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className={cn(
                glassBtnIcon,
                "relative h-9 gap-1.5 px-3 sm:w-auto",
                (filterOpen || hasActiveFilters) &&
                  "border-studio-border/40 bg-studio-soft text-studio-light"
              )}
              aria-label="Filtrer l'activité"
              aria-expanded={filterOpen}
              aria-haspopup="dialog"
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="text-xs font-medium sm:text-[13px]">Filtres</span>
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
                aria-label="Filtres activité"
                className={cn(
                  glassDropdownPlain,
                  "absolute right-0 top-full z-50 mt-1.5 w-[min(260px,calc(100vw-2rem))] max-h-[min(70vh,480px)] overflow-y-auto"
                )}
              >
                <p className={dropdownSectionLabel}>Période</p>
                {PERIOD_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPeriod(f.id)}
                    className={cn(
                      dropdownItem,
                      period === f.id ? dropdownItemActive : dropdownItemInactive
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

                <p className={cn(dropdownSectionLabel, "mt-1")}>Type</p>
                {ACTIVITY_ENTITY_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setEntityFilter(f.id)}
                    className={cn(
                      dropdownItem,
                      entityFilter === f.id ? dropdownItemActive : dropdownItemInactive
                    )}
                  >
                    {f.label}
                  </button>
                ))}

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
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#8ba4c7]/30 border-t-[#8ba4c7]" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={History}
          title="Erreur de chargement"
          description="Impossible de charger l'historique d'activité."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="Aucune activité"
          description="Les actions sur vos projets apparaîtront ici."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="Aucun résultat"
          description="Aucune activité ne correspond à vos filtres."
          actionLabel="Réinitialiser les filtres"
          onAction={resetFilters}
        />
      ) : (
        <div className={activityListWrap}>
          <p className="border-b border-[#8ba4c7]/[0.06] px-4 py-2.5 text-[10px] font-medium uppercase tracking-wide text-[#8ba4c7]/40">
            {filtered.length} événement{filtered.length > 1 ? "s" : ""}
          </p>
          <ul>
            {filtered.map((log) => (
              <ActivityRow key={log.id} log={log} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
