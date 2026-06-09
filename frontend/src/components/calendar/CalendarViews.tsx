"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { dateKey } from "@/lib/dates";
import { eventsOnDay, groupEventsByDay, groupEventsForList } from "@/lib/calendar";
import type { CalendarEvent } from "@/types";
import { cn } from "@/lib/utils";
import CalendarEventChip, { CalendarEventRow } from "./CalendarEventChip";
import {
  calendarDayCellBase,
  calendarDayCellOutOfMonth,
  calendarDayCellSelected,
  calendarDayCellToday,
  calendarDayNumber,
  calendarDayNumberToday,
  calendarDayViewShell,
  calendarGridShell,
  calendarWeekColumn,
  calendarWeekDayHeader,
} from "./calendar-ui";

interface MonthViewProps {
  anchor: Date;
  events: CalendarEvent[];
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarMonthView({
  anchor,
  events,
  selectedDay,
  onSelectDay,
  onEventClick,
}: MonthViewProps) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const byDay = groupEventsByDay(events);
  const today = new Date();

  const monthDays = days.filter((day) => isSameMonth(day, anchor));

  return (
    <div className={calendarGridShell}>
      <div className="space-y-2 sm:hidden">
        {monthDays.map((day) => {
          const key = dateKey(day);
          const dayEvents = byDay.get(key) ?? [];
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);

          return (
            <button
              key={`mobile-${key}`}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "w-full rounded-lg border border-[#8ba4c7]/[0.06] bg-white/[0.02] p-3 text-left transition",
                isSelected && "border-studio-border/50 bg-studio-soft",
                isToday && !isSelected && "border-studio-border/30"
              )}
            >
              <p className="mb-2 text-[12px] font-medium capitalize text-[#e8edf4]/88">
                {format(day, "EEE d MMM", { locale: fr })}
              </p>
              {dayEvents.length === 0 ? (
                <p className="text-[11px] text-[#8ba4c7]/38">Aucun événement</p>
              ) : (
                <div className="space-y-1">
                  {dayEvents.map((ev) => (
                    <CalendarEventChip key={ev.id} event={ev} onClick={onEventClick} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mb-1 hidden grid-cols-7 gap-1 sm:grid">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
          <span key={d} className={calendarWeekDayHeader}>
            {d}
          </span>
        ))}
      </div>
      <div className="hidden grid-cols-7 gap-1 sm:grid">
        {days.map((day) => {
          const key = dateKey(day);
          const dayEvents = byDay.get(key) ?? [];
          const inMonth = isSameMonth(day, anchor);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);
          const visible = dayEvents.slice(0, 3);
          const extra = dayEvents.length - visible.length;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                calendarDayCellBase,
                !inMonth && calendarDayCellOutOfMonth,
                isToday && !isSelected && calendarDayCellToday,
                isSelected && calendarDayCellSelected
              )}
            >
              <span className={cn(isToday ? calendarDayNumberToday : calendarDayNumber)}>
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {visible.map((ev) => (
                  <CalendarEventChip
                    key={ev.id}
                    event={ev}
                    compact
                    onClick={onEventClick}
                  />
                ))}
                {extra > 0 && (
                  <span className="block px-1 text-[9px] text-[#8ba4c7]/40">
                    + {extra} autres
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface WeekViewProps {
  anchor: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarWeekView({ anchor, events, onEventClick }: WeekViewProps) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start,
    end: endOfWeek(anchor, { weekStartsOn: 1 }),
  });

  return (
    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-7">
      {days.map((day) => {
        const dayEvents = eventsOnDay(events, day);
        return (
          <div key={dateKey(day)} className={calendarWeekColumn}>
            <p className="mb-2 text-[11px] font-semibold capitalize text-[#e8edf4]/85">
              {format(day, "EEE d MMM", { locale: fr })}
            </p>
            <div className="space-y-1">
              {dayEvents.length === 0 ? (
                <p className="text-[10px] text-[#8ba4c7]/38">—</p>
              ) : (
                dayEvents.map((ev) => (
                  <CalendarEventChip key={ev.id} event={ev} onClick={onEventClick} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DayViewProps {
  day: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  /** Sans bordure/padding — utilisé dans le panneau détail du mois */
  embedded?: boolean;
}

export function CalendarDayView({ day, events, onEventClick, embedded }: DayViewProps) {
  const dayEvents = eventsOnDay(events, day);

  const content = (
    <>
      {!embedded && (
        <h2 className="mb-3 text-[15px] font-semibold capitalize text-[#e8edf4]/90">
          {format(day, "EEEE d MMMM yyyy", { locale: fr })}
        </h2>
      )}
      {dayEvents.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-[#8ba4c7]/45">
          Aucun événement prévu ce jour.
        </p>
      ) : (
        <div className="space-y-1.5">
          {dayEvents.map((ev) => (
            <CalendarEventChip key={ev.id} event={ev} onClick={onEventClick} />
          ))}
        </div>
      )}
    </>
  );

  if (embedded) return <div>{content}</div>;

  return <div className={calendarDayViewShell}>{content}</div>;
}

interface ListViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarListView({ events, onEventClick }: ListViewProps) {
  const groups = groupEventsForList(events);

  const sections: { key: string; label: string; items: CalendarEvent[] }[] = [
    { key: "today", label: "Aujourd'hui", items: groups.today },
    { key: "tomorrow", label: "Demain", items: groups.tomorrow },
    { key: "week", label: "Cette semaine", items: groups.week },
    { key: "later", label: "Plus tard", items: groups.later },
  ];

  const hasAny = sections.some((s) => s.items.length > 0);

  if (!hasAny) {
    return (
      <p className="py-12 text-center text-[12px] text-[#8ba4c7]/45">
        Aucun événement à venir.
      </p>
    );
  }

  return (
    <div className={cn(calendarDayViewShell, "space-y-4")}>
      {sections.map(
        (section) =>
          section.items.length > 0 && (
            <div key={section.key}>
              <h3 className="mb-2 text-[12px] font-semibold text-[#b8cfe8]/80">
                {section.label}
              </h3>
              <div className="space-y-1.5">
                {section.items.map((ev) => (
                  <CalendarEventRow key={ev.id} event={ev} onClick={onEventClick} />
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}
