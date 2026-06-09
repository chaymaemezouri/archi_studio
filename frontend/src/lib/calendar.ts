import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { fr } from "date-fns/locale";
import { dateKey } from "@/lib/dates";
import type { CalendarEvent, CalendarEventType, CalendarTypeFilter } from "@/types";

export function getRangeForView(
  anchor: Date,
  view: "month" | "week" | "day" | "list"
): { from: string; to: string } {
  if (view === "day") {
    const d = format(anchor, "yyyy-MM-dd");
    return { from: d, to: d };
  }
  if (view === "week") {
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    const end = endOfWeek(anchor, { weekStartsOn: 1 });
    return { from: format(start, "yyyy-MM-dd"), to: format(end, "yyyy-MM-dd") };
  }
  if (view === "list") {
    const start = startOfDay(new Date());
    const end = addDays(start, 90);
    return { from: format(start, "yyyy-MM-dd"), to: format(end, "yyyy-MM-dd") };
  }
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  return { from: format(start, "yyyy-MM-dd"), to: format(end, "yyyy-MM-dd") };
}

export function filterCalendarEvents(
  events: CalendarEvent[],
  options: {
    typeFilter: CalendarTypeFilter;
    query: string;
    hideDone?: boolean;
  }
): CalendarEvent[] {
  let list = events;

  if (options.hideDone !== false) {
    list = list.filter((e) => e.status !== "DONE" && e.status !== "CANCELLED");
  }

  if (options.typeFilter !== "all") {
    if (options.typeFilter === "DEADLINE_PROJECT") {
      list = list.filter((e) => e.type === "DEADLINE_PROJECT");
    } else if (options.typeFilter === "DEADLINE_TASK") {
      list = list.filter((e) => e.type === "DEADLINE_TASK");
    } else if (options.typeFilter === "MEETING") {
      list = list.filter((e) => e.type === "MEETING");
    } else if (options.typeFilter === "SITE_VISIT") {
      list = list.filter((e) => e.type === "SITE_VISIT");
    } else if (options.typeFilter === "INVOICE_REMINDER") {
      list = list.filter((e) => e.type === "INVOICE_REMINDER");
    } else if (options.typeFilter === "PAYMENT_REMINDER") {
      list = list.filter((e) => e.type === "PAYMENT_REMINDER");
    }
  }

  const q = options.query.trim().toLowerCase();
  if (q) {
    list = list.filter((e) => {
      const hay = [
        e.title,
        e.projectName,
        e.clientName,
        e.type,
        e.notes,
        e.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return list;
}

export function groupEventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const key = dateKey(e.date);
    const arr = map.get(key) ?? [];
    arr.push(e);
    map.set(key, arr);
  }
  for (const key of Array.from(map.keys())) {
    const arr = map.get(key)!;
    arr.sort((a: CalendarEvent, b: CalendarEvent) => {
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }
  return map;
}

export function eventsOnDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const key = dateKey(day);
  return events.filter((e) => dateKey(e.date) === key);
}

export function isEventDone(event: CalendarEvent): boolean {
  return event.status === "DONE" || event.status === "CANCELLED";
}

export function isEventUrgent(event: CalendarEvent): boolean {
  return event.priority === "URGENT" || event.priority === "HIGH";
}

export function formatEventTime(event: CalendarEvent): string {
  if (event.startTime) {
    return event.endTime
      ? `${event.startTime} – ${event.endTime}`
      : event.startTime;
  }
  return "";
}

export function formatDayLabel(date: Date): string {
  return format(date, "EEEE d MMMM", { locale: fr });
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy", { locale: fr });
}

export type ListGroup = "today" | "tomorrow" | "week" | "later";

export function groupEventsForList(events: CalendarEvent[]): Record<ListGroup, CalendarEvent[]> {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const weekEnd = addDays(today, 7);

  const groups: Record<ListGroup, CalendarEvent[]> = {
    today: [],
    tomorrow: [],
    week: [],
    later: [],
  };

  const upcoming = [...events]
    .filter((e) => startOfDay(parseISO(e.date.split("T")[0])) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const e of upcoming) {
    const d = startOfDay(parseISO(e.date.split("T")[0]));
    if (isSameDay(d, today)) groups.today.push(e);
    else if (isSameDay(d, tomorrow)) groups.tomorrow.push(e);
    else if (isWithinInterval(d, { start: addDays(today, 2), end: weekEnd }))
      groups.week.push(e);
    else groups.later.push(e);
  }

  return groups;
}

export { addMonths, subMonths, addWeeks, subWeeks, isSameDay, isSameMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format };
