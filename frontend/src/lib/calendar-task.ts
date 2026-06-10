import type { CalendarEvent } from "@/types";
import type { Priority, Task } from "@/types";

export function getTaskIdFromCalendarEvent(event: CalendarEvent): string | null {
  if (event.sourceId) return event.sourceId;
  if (event.id.startsWith("gen-task-")) return event.id.slice("gen-task-".length);
  return null;
}

export function calendarPriorityToTask(
  priority?: string | null
): Priority {
  return priority === "URGENT" ? "URGENT" : "MEDIUM";
}

export function calendarFormToTaskPayload(
  payload: Partial<CalendarEvent>
): Partial<Task> {
  const dueDate = payload.date?.split("T")[0];
  const scheduledAt =
    dueDate && payload.startTime
      ? new Date(`${dueDate}T${payload.startTime}`).toISOString()
      : undefined;

  return {
    title: payload.title,
    dueDate: dueDate || undefined,
    scheduledAt,
    projectId: payload.projectId || undefined,
    clientId: payload.clientId || undefined,
    notes: payload.notes || undefined,
    priority: calendarPriorityToTask(payload.priority),
  };
}

export function isCalendarTaskEvent(event?: CalendarEvent | null): boolean {
  if (!event) return false;
  return event.type === "DEADLINE_TASK" || event.source === "task";
}
