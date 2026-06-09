"use client";

import type { CalendarEvent } from "@/types";
import {
  CALENDAR_EVENT_TYPE_ACCENT,
  CALENDAR_EVENT_TYPE_COLORS,
  CALENDAR_EVENT_TYPE_LABELS,
} from "@/types";
import { calendarEventChipBase, calendarListRow } from "./calendar-ui";
import { cn, formatDate } from "@/lib/utils";
import { formatEventTime, isEventDone, isEventUrgent } from "@/lib/calendar";

interface CalendarEventChipProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: (event: CalendarEvent) => void;
}

export default function CalendarEventChip({
  event,
  compact,
  onClick,
}: CalendarEventChipProps) {
  const time = formatEventTime(event);
  const done = isEventDone(event);
  const urgent = isEventUrgent(event);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={cn(
        calendarEventChipBase,
        CALENDAR_EVENT_TYPE_COLORS[event.type],
        done && "opacity-50 line-through",
        compact ? "truncate" : ""
      )}
    >
      <span className="font-medium">{event.title}</span>
      {!compact && (
        <span className="mt-0.5 block text-[9px] opacity-80">
          {CALENDAR_EVENT_TYPE_LABELS[event.type]}
          {time && ` · ${time}`}
          {event.projectName && ` · ${event.projectName}`}
        </span>
      )}
      {urgent && !done && (
        <span className="ml-1 inline-block rounded bg-red-500/30 px-1 text-[8px] uppercase">
          Urgent
        </span>
      )}
    </button>
  );
}

export function CalendarEventRow({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
}) {
  const time = formatEventTime(event);
  const done = isEventDone(event);

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className={cn(
        calendarListRow,
        CALENDAR_EVENT_TYPE_ACCENT[event.type],
        done && "opacity-60"
      )}
    >
      <span
        className={cn(
          "mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ring-[#8ba4c7]/[0.08]",
          CALENDAR_EVENT_TYPE_COLORS[event.type]
        )}
      >
        {CALENDAR_EVENT_TYPE_LABELS[event.type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[13px] font-medium text-glass", done && "line-through")}>
          {event.title}
        </p>
        <p className="mt-0.5 text-[11px] text-glass-muted">
          {formatDate(event.date)}
          {time && ` · ${time}`}
          {event.projectName && ` · ${event.projectName}`}
          {event.clientName && ` · ${event.clientName}`}
        </p>
      </div>
    </button>
  );
}
