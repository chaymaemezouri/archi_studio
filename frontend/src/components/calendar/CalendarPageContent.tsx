"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addDays, addMonths, addWeeks, format, subMonths, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import {
  CalendarDayView,
  CalendarListView,
  CalendarMonthView,
  CalendarWeekView,
} from "./CalendarViews";
import CalendarEventDetailModal, {
  CalendarEventCreateModal,
} from "./CalendarEventModals";
import {
  calendarDayDetailPanel,
  calendarLink,
  calendarPage,
  calendarPanel,
  calendarToolbar,
} from "./calendar-ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCalendarEvents } from "@/hooks/useCalendar";
import {
  filterCalendarEvents,
  formatMonthYear,
  getRangeForView,
} from "@/lib/calendar";
import {
  getInitialCalendarShowDone,
  getInitialCalendarView,
  VIEW_KEYS,
} from "@/lib/settings-user-prefs";
import {
  accentBar,
  dropdownItem,
  dropdownItemActive,
  dropdownItemInactive,
  dropdownSectionLabel,
  glassBtnIcon,
  glassBtnSecondary,
  glassDropdownPlain,
  glassInput,
} from "@/lib/glass-styles";
import type {
  CalendarEvent,
  CalendarTypeFilter,
  CalendarViewMode,
} from "@/types";
import { cn } from "@/lib/utils";

const VIEW_OPTIONS: { id: CalendarViewMode; label: string }[] = [
  { id: "month", label: "Mois" },
  { id: "week", label: "Semaine" },
  { id: "day", label: "Jour" },
  { id: "list", label: "Liste" },
];

const FILTER_OPTIONS: { id: CalendarTypeFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "DEADLINE_PROJECT", label: "Deadlines" },
  { id: "DEADLINE_TASK", label: "Tâches" },
  { id: "MEETING", label: "Réunions" },
  { id: "SITE_VISIT", label: "Chantier" },
  { id: "INVOICE_REMINDER", label: "Factures" },
  { id: "PAYMENT_REMINDER", label: "Paiements" },
];

export default function CalendarPageContent() {
  const [anchor, setAnchor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [view, setView] = useState<CalendarViewMode>("month");
  const [typeFilter, setTypeFilter] = useState<CalendarTypeFilter>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [showDone, setShowDone] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setView(getInitialCalendarView());
    setShowDone(getInitialCalendarShowDone());
  }, []);

  useEffect(() => {
    localStorage.setItem(VIEW_KEYS.calendar, view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem(VIEW_KEYS.calendarShowDone, String(showDone));
  }, [showDone]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);

  const range = useMemo(
    () => getRangeForView(view === "day" ? selectedDay : anchor, view),
    [anchor, selectedDay, view]
  );

  const { data: events = [], isLoading, isError, refetch } = useCalendarEvents(
    range.from,
    range.to
  );

  const filtered = useMemo(
    () =>
      filterCalendarEvents(events, {
        typeFilter,
        query: debouncedSearch,
        hideDone: !showDone,
      }),
    [events, typeFilter, debouncedSearch, showDone]
  );

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
    if (!viewOpen) return;
    const close = (e: MouseEvent) => {
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) {
        setViewOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [viewOpen]);

  const resetFilters = useCallback(() => {
    setTypeFilter("all");
    setSearch("");
    setShowDone(false);
  }, []);

  const hasActiveFilters = typeFilter !== "all" || search.trim() !== "" || showDone;

  const goToday = () => {
    const now = new Date();
    setAnchor(now);
    setSelectedDay(now);
  };

  const navigate = (dir: -1 | 1) => {
    if (view === "month") setAnchor((d) => (dir === 1 ? addMonths(d, 1) : subMonths(d, 1)));
    else if (view === "week") setAnchor((d) => (dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)));
    else if (view === "day") setSelectedDay((d) => addDays(d, dir === 1 ? 1 : -1));
  };

  const headerLabel =
    view === "day"
      ? formatMonthYear(selectedDay)
      : view === "week"
        ? `Semaine · ${formatMonthYear(anchor)}`
        : view === "list"
          ? "Événements à venir"
          : formatMonthYear(anchor);

  const headerLabelShort =
    view === "day"
      ? format(selectedDay, "d MMM", { locale: fr })
      : view === "week"
        ? format(anchor, "MMM yy", { locale: fr })
        : view === "list"
          ? "Liste"
          : format(anchor, "MMM yy", { locale: fr });

  const openCreate = (date?: Date) => {
    if (date) setSelectedDay(date);
    setEditingEvent(null);
    setCreateOpen(true);
  };

  const hasFilter = typeFilter !== "all" || search.trim() !== "" || showDone;

  return (
    <div className={calendarPage}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-app-primary sm:text-2xl">
            <span className={accentBar} aria-hidden />
            Calendrier
          </h1>
          <p className="mt-0.5 text-xs text-glass-muted sm:text-sm">
            Suivez vos deadlines, tâches, réunions et visites chantier
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreate(selectedDay)}
          className="hidden h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-app bg-[color:var(--glass-bg)] px-4 text-sm font-medium text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light sm:inline-flex"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Ajouter un événement
        </button>
      </div>

      <div
        className={cn(
          calendarPanel,
          (filterOpen || viewOpen) && "relative z-40"
        )}
      >
        <div className={calendarToolbar}>
          <button
            type="button"
            onClick={() => openCreate(selectedDay)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-app bg-[color:var(--glass-bg)] text-app-primary/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition hover:border-[#8ba4c7]/[0.14] hover:bg-[#8ba4c7]/[0.05] hover:text-studio-light sm:hidden"
            aria-label="Ajouter un événement"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <div className="relative min-w-0 flex-1 lg:w-[min(100%,280px)] lg:shrink-0">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-glass-muted"
              strokeWidth={1.75}
            />
            <input
              type="search"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(glassInput, "h-9 w-full py-0 pl-9 pr-3 text-[13px]")}
              aria-label="Rechercher dans le calendrier"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:min-w-0 lg:flex-1 lg:justify-center">
            <button
              type="button"
              onClick={goToday}
              className={cn(glassBtnSecondary, "hidden h-9 px-2.5 text-xs sm:inline-flex")}
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              onClick={goToday}
              className={cn(glassBtnIcon, "h-9 w-9 sm:hidden")}
              aria-label="Aujourd'hui"
              title="Aujourd'hui"
            >
              <Calendar className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={cn(glassBtnIcon, "h-9 w-8 px-0 sm:w-9")}
                aria-label="Période précédente"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <span
                className="max-w-[4.5rem] truncate px-0.5 text-center text-[11px] font-medium capitalize text-glass sm:max-w-none sm:min-w-[120px] sm:text-[13px] lg:min-w-[140px]"
                title={headerLabel}
              >
                <span className="sm:hidden">{headerLabelShort}</span>
                <span className="hidden sm:inline">{headerLabel}</span>
              </span>
              <button
                type="button"
                onClick={() => navigate(1)}
                className={cn(glassBtnIcon, "h-9 w-8 px-0 sm:w-9")}
                aria-label="Période suivante"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div ref={viewRef} className="relative sm:hidden">
              <button
                type="button"
                onClick={() => {
                  setViewOpen((v) => !v);
                  setFilterOpen(false);
                }}
                className={cn(
                  glassBtnIcon,
                  "h-9 w-9 shrink-0 px-0",
                  viewOpen && "border-studio-border/40 bg-studio-soft text-studio-light"
                )}
                aria-label="Changer la vue"
                aria-expanded={viewOpen}
                aria-haspopup="listbox"
                title={VIEW_OPTIONS.find((v) => v.id === view)?.label}
              >
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 transition", viewOpen && "rotate-180")}
                  strokeWidth={1.75}
                />
              </button>

              {viewOpen && (
                <ul
                  role="listbox"
                  aria-label="Vue du calendrier"
                  className={cn(
                    glassDropdownPlain,
                    "absolute right-0 top-full z-50 mt-1.5 min-w-[140px]"
                  )}
                >
                  {VIEW_OPTIONS.map((v) => (
                    <li key={v.id} role="option" aria-selected={view === v.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setView(v.id);
                          setViewOpen(false);
                        }}
                        className={cn(
                          dropdownItem,
                          view === v.id ? dropdownItemActive : dropdownItemInactive
                        )}
                      >
                        {v.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="hidden max-w-full overflow-x-auto rounded-lg border border-app p-0.5 sm:flex [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {VIEW_OPTIONS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition",
                    view === v.id
                      ? "bg-studio-soft text-studio-light"
                      : "text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-glass-secondary"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div ref={filterRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setFilterOpen((v) => !v);
                setViewOpen(false);
              }}
              className={cn(
                glassBtnIcon,
                "relative h-9 w-9 shrink-0 px-0 sm:w-auto sm:gap-1.5 sm:px-3",
                (filterOpen || hasActiveFilters) &&
                  "border-studio-border/40 bg-studio-soft text-studio-light"
              )}
              aria-label="Filtrer le calendrier"
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
                aria-label="Filtres du calendrier"
                className={cn(
                  glassDropdownPlain,
                  "absolute right-0 top-full z-50 mt-1.5 w-[min(220px,calc(100vw-2rem))] max-h-[min(70vh,400px)] overflow-y-auto"
                )}
              >
                <p className={dropdownSectionLabel}>Type d&apos;événement</p>
                {FILTER_OPTIONS.map((f) => (
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

                <label className="mt-2 flex cursor-pointer items-center gap-2 border-t border-app px-3 py-2.5 text-[12px] text-glass-muted">
                  <input
                    type="checkbox"
                    checked={showDone}
                    onChange={(e) => setShowDone(e.target.checked)}
                    className="rounded border-[#8ba4c7]/[0.12] bg-[color:var(--glass-bg)] text-studio-light focus:ring-[#8ba4c7]/20"
                  />
                  Afficher terminés
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#8ba4c7]/30 border-t-[#8ba4c7]" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Calendar}
          title="Erreur de chargement"
          description="Impossible de charger le calendrier."
          actionLabel="Réessayer"
          onAction={() => refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={hasFilter ? "Aucun résultat" : "Aucun événement prévu"}
          description={
            hasFilter
              ? "Aucun événement ne correspond à ce filtre."
              : "Ajoutez un événement ou créez des deadlines dans vos projets."
          }
          actionLabel="Ajouter un événement"
          onAction={() => openCreate()}
        />
      ) : (
        <>
          {view === "month" && (
            <CalendarMonthView
              anchor={anchor}
              events={filtered}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onEventClick={setDetailEvent}
            />
          )}
          {view === "week" && (
            <CalendarWeekView
              anchor={anchor}
              events={filtered}
              onEventClick={setDetailEvent}
            />
          )}
          {view === "day" && (
            <CalendarDayView
              day={selectedDay}
              events={filtered}
              onEventClick={setDetailEvent}
            />
          )}
          {view === "list" && (
            <CalendarListView events={filtered} onEventClick={setDetailEvent} />
          )}

          {view === "month" && (
            <div className={calendarDayDetailPanel}>
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-semibold text-app-primary/90">
                  Détail du{" "}
                  {selectedDay.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                <button
                  type="button"
                  onClick={() => openCreate(selectedDay)}
                  className={calendarLink}
                >
                  + Ajouter
                </button>
              </div>
              <CalendarDayView
                day={selectedDay}
                events={filtered}
                onEventClick={setDetailEvent}
                embedded
              />
            </div>
          )}
        </>
      )}

      <CalendarEventCreateModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditingEvent(null);
        }}
        defaultDate={selectedDay}
        editing={editingEvent}
      />

      <CalendarEventDetailModal
        event={detailEvent}
        open={!!detailEvent}
        onClose={() => setDetailEvent(null)}
        onEditCustom={(ev) => {
          setEditingEvent(ev);
          setCreateOpen(true);
        }}
      />
    </div>
  );
}
