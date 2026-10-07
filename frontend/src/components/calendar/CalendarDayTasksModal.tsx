"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  CalendarPlus,
  CheckCircle2,
  Circle,
  ExternalLink,
  ListTodo,
  Pencil,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import ColorSwatchPicker from "@/components/ui/ColorSwatchPicker";
import DashboardTaskCheckbox from "@/components/dashboard/DashboardTaskCheckbox";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import {
  useReorderDayAgenda,
  useUpdateCalendarEvent,
  type DayReorderItem,
} from "@/hooks/useCalendar";
import { eventsOnDay, formatEventTime, isEventDone } from "@/lib/calendar";
import {
  getTaskIdFromCalendarEvent,
  isCalendarTaskEvent,
} from "@/lib/calendar-task";
import { toLocalDateInput } from "@/lib/dates";
import { glassBtnPrimary, glassBtnSecondary, glassInput } from "@/lib/glass-styles";
import { taskColorChipStyle } from "@/lib/task-color";
import type { CalendarEvent } from "@/types";
import { CALENDAR_EVENT_TYPE_LABELS } from "@/types";
import { cn } from "@/lib/utils";

interface CalendarDayTasksModalProps {
  open: boolean;
  day: Date | null;
  events: CalendarEvent[];
  onClose: () => void;
  onOpenEvent?: (event: CalendarEvent) => void;
  onEditEvent?: (event: CalendarEvent) => void;
}

function isReorderableEvent(event: CalendarEvent): boolean {
  if (isCalendarTaskEvent(event) && getTaskIdFromCalendarEvent(event)) return true;
  return event.source === "custom" && event.editable;
}

function canColorEvent(event: CalendarEvent): boolean {
  return isReorderableEvent(event);
}

function reorderItemKey(event: CalendarEvent): DayReorderItem | null {
  if (isCalendarTaskEvent(event)) {
    const id = getTaskIdFromCalendarEvent(event);
    return id ? { source: "task", id } : null;
  }
  if (event.source === "custom" && event.editable) {
    return { source: "custom", id: event.id };
  }
  return null;
}

function sortDayEvents(list: CalendarEvent[]): CalendarEvent[] {
  return [...list].sort((a, b) => {
    const ad = isEventDone(a) ? 1 : 0;
    const bd = isEventDone(b) ? 1 : 0;
    if (ad !== bd) return ad - bd;

    const aOrd = isReorderableEvent(a);
    const bOrd = isReorderableEvent(b);
    if (aOrd && bOrd) {
      const so = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (so !== 0) return so;
      return a.title.localeCompare(b.title, "fr");
    }
    if (aOrd && !bOrd) return -1;
    if (!aOrd && bOrd) return 1;

    const at = a.startTime ?? "";
    const bt = b.startTime ?? "";
    if (at || bt) return at.localeCompare(bt);
    return a.title.localeCompare(b.title, "fr");
  });
}

export default function CalendarDayTasksModal({
  open,
  day,
  events,
  onClose,
  onOpenEvent,
  onEditEvent,
}: CalendarDayTasksModalProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(true);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const reorderDay = useReorderDayAgenda();
  const updateEvent = useUpdateCalendarEvent();

  const dayEvents = useMemo(() => {
    if (!day) return [];
    return sortDayEvents(eventsOnDay(events, day));
  }, [day, events]);

  const openReorderable = useMemo(
    () => dayEvents.filter((e) => !isEventDone(e) && isReorderableEvent(e)),
    [dayEvents]
  );

  const visible = useMemo(
    () => (showDone ? dayEvents : dayEvents.filter((e) => !isEventDone(e))),
    [dayEvents, showDone]
  );

  const openCount = dayEvents.filter((e) => !isEventDone(e)).length;
  const doneCount = dayEvents.length - openCount;

  if (!day) return null;

  const dateLabel = format(day, "EEEE d MMMM yyyy", { locale: fr });
  const dateStr = toLocalDateInput(day);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await createTask.mutateAsync({
        title: newTitle.trim(),
        dueDate: dateStr,
        scheduledAt: dateStr,
        ...(newColor ? { color: newColor } : {}),
      });
      setNewTitle("");
      setNewColor(null);
    } catch {
      /* toast hook */
    }
  };

  const handleToggleDone = (event: CalendarEvent) => {
    const done = isEventDone(event);
    if (isCalendarTaskEvent(event)) {
      const taskId = getTaskIdFromCalendarEvent(event);
      if (!taskId) return;
      updateTask.mutate({
        id: taskId,
        status: done ? "TODO" : "DONE",
        silent: true,
      });
      return;
    }
    if (event.source === "custom" && event.editable) {
      updateEvent.mutate({
        id: event.id,
        status: done ? "ACTIVE" : "DONE",
        silent: true,
      });
    }
  };

  const handleColorChange = (event: CalendarEvent, color: string | null) => {
    if (isCalendarTaskEvent(event)) {
      const taskId = getTaskIdFromCalendarEvent(event);
      if (!taskId) return;
      updateTask.mutate({ id: taskId, color, silent: true });
      return;
    }
    if (event.source === "custom" && event.editable) {
      updateEvent.mutate({ id: event.id, color, silent: true });
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= openReorderable.length) return;
    const items = openReorderable
      .map((e) => reorderItemKey(e))
      .filter((x): x is DayReorderItem => Boolean(x));
    if (items.length !== openReorderable.length) return;
    const tmp = items[index];
    items[index] = items[next];
    items[next] = tmp;
    reorderDay.mutate(items);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Journée"
      variant="glass"
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-app pb-3">
          <div>
            <p className="text-[15px] font-semibold capitalize text-app-primary">
              {dateLabel}
            </p>
            <p className="mt-0.5 text-[12px] text-glass-muted">
              {openCount} à faire
              {doneCount > 0 ? ` · ${doneCount} terminée${doneCount > 1 ? "s" : ""}` : ""}
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-glass-muted">
            <input
              type="checkbox"
              checked={showDone}
              onChange={(e) => setShowDone(e.target.checked)}
              className="rounded border-glass"
            />
            Afficher terminées
          </label>
        </div>

        <form onSubmit={handleAddTask} className="rounded-xl border border-app bg-[color:var(--glass-bg)] p-3">
          <div className="flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nouvelle tâche pour ce jour…"
              className={cn(glassInput, "flex-1 text-[13px]")}
            />
            <ColorSwatchPicker value={newColor} onChange={setNewColor} />
            <button
              type="submit"
              disabled={!newTitle.trim() || createTask.isPending}
              className={cn(glassBtnPrimary, "shrink-0 px-3")}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>
        </form>

        <ul className="max-h-[min(55vh,22rem)] space-y-2 overflow-x-hidden overflow-y-auto pr-0.5">
          {visible.length === 0 ? (
            <li className="flex flex-col items-center gap-2 py-8 text-center">
              <ListTodo className="h-8 w-8 text-glass-muted/40" strokeWidth={1.25} />
              <p className="text-[12px] text-glass-muted">
                Rien de prévu ce jour-là. Ajoutez une tâche ci-dessus.
              </p>
            </li>
          ) : (
            visible.map((event) => {
              const done = isEventDone(event);
              const isTask = isCalendarTaskEvent(event);
              const canToggle =
                isTask || (event.source === "custom" && event.editable);
              const canColor = canColorEvent(event);
              const time = formatEventTime(event);
              const reorderIndex =
                !done && isReorderableEvent(event)
                  ? openReorderable.findIndex((e) => e.id === event.id)
                  : -1;
              const canReorder =
                reorderIndex >= 0 && openReorderable.length > 1;

              const hasColor = Boolean(event.color?.trim());

              return (
                <li
                  key={event.id}
                  className={cn(
                    "rounded-lg border p-3 transition",
                    hasColor
                      ? "text-[#0f172a]"
                      : "border-app bg-[color:var(--glass-bg)]",
                    done && "opacity-70"
                  )}
                  style={
                    hasColor && event.color
                      ? taskColorChipStyle(event.color)
                      : undefined
                  }
                >
                  <div className="flex items-start gap-2.5">
                    {canReorder && (
                      <div className="mt-0.5 flex shrink-0 flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveItem(reorderIndex, -1)}
                          disabled={
                            reorderIndex === 0 || reorderDay.isPending
                          }
                          className="rounded p-0.5 text-glass-muted transition hover:bg-black/5 hover:text-[#0f172a] disabled:opacity-25"
                          aria-label="Monter (plus important)"
                          title="Monter"
                        >
                          <ArrowUp className="h-3 w-3" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(reorderIndex, 1)}
                          disabled={
                            reorderIndex === openReorderable.length - 1 ||
                            reorderDay.isPending
                          }
                          className="rounded p-0.5 text-glass-muted transition hover:bg-black/5 hover:text-[#0f172a] disabled:opacity-25"
                          aria-label="Descendre (moins important)"
                          title="Descendre"
                        >
                          <ArrowDown className="h-3 w-3" strokeWidth={2} />
                        </button>
                      </div>
                    )}

                    {canToggle ? (
                      <DashboardTaskCheckbox
                        checked={done}
                        onToggle={() => handleToggleDone(event)}
                      />
                    ) : done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-glass-muted" />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenEvent?.(event)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p
                            className={cn(
                              "text-[13px] font-medium",
                              hasColor ? "text-[#0f172a]" : "text-app-primary",
                              done && "line-through text-glass-muted"
                            )}
                          >
                            {event.title}
                          </p>
                          <p
                            className={cn(
                              "mt-0.5 text-[11px]",
                              hasColor ? "text-slate-600" : "text-glass-muted"
                            )}
                          >
                            {CALENDAR_EVENT_TYPE_LABELS[event.type]}
                            {time ? ` · ${time}` : ""}
                            {event.projectName ? ` · ${event.projectName}` : ""}
                          </p>
                        </button>
                        {canColor && (
                          <ColorSwatchPicker
                            compact
                            value={event.color}
                            onChange={(c) => handleColorChange(event, c)}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-1">
                      {event.editable && (
                        <button
                          type="button"
                          title="Modifier"
                          onClick={() => onEditEvent?.(event)}
                          className="rounded-lg p-1.5 text-glass-muted transition hover:bg-studio-muted hover:text-studio-light"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {event.projectId && (
                        <a
                          href={`/projects/${event.projectId}?tab=tasks`}
                          title="Ouvrir le projet"
                          className="rounded-lg p-1.5 text-glass-muted transition hover:bg-studio-muted hover:text-studio-light"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex justify-end border-t border-app pt-3">
          <button type="button" onClick={onClose} className={glassBtnSecondary}>
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
