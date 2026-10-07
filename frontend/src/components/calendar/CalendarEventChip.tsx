"use client";

import type { CalendarEvent } from "@/types";
import {
  CALENDAR_EVENT_TYPE_ACCENT,
  CALENDAR_EVENT_TYPE_COLORS,
  CALENDAR_EVENT_TYPE_LABELS,
} from "@/types";
import { calendarEventChipBase, calendarListRow } from "./calendar-ui";
import { formatEventTime, isEventDone, isEventUrgent } from "@/lib/calendar";
import { taskColorChipStyle } from "@/lib/task-color";
import { cn, formatDate } from "@/lib/utils";

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

  const customColor = Boolean(event.color?.trim());

  // div (pas button) : les cellules jour sont déjà des <button> — imbriquer
  // casse le style / le clic dans certains navigateurs.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onClick?.(event);
        }
      }}
      className={cn(
        "w-full cursor-pointer rounded-md px-1.5 py-0.5 text-left text-[10px] leading-snug transition",
        customColor
          ? "border font-medium text-[#0f172a] hover:brightness-[0.98]"
          : cn(calendarEventChipBase, CALENDAR_EVENT_TYPE_COLORS[event.type]),
        done && "opacity-50 line-through",
        compact && "truncate"
      )}
      style={customColor && event.color ? taskColorChipStyle(event.color) : undefined}
    >
      <span className={cn("font-medium", customColor && "!text-[#0f172a]")}>
        {event.title}
        {urgent && !done && (
          <span className="ml-1 inline-block rounded-full bg-red-100 px-1.5 py-px text-[8px] font-semibold uppercase tracking-wide text-red-700">
            Urgent
          </span>
        )}
      </span>
      {!compact && (
        <span
          className={cn(
            "mt-0.5 block text-[9px]",
            customColor ? "!text-slate-600" : "opacity-80"
          )}
        >
          {CALENDAR_EVENT_TYPE_LABELS[event.type]}
          {time && ` · ${time}`}
          {event.projectName && ` · ${event.projectName}`}
        </span>
      )}
    </div>
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
