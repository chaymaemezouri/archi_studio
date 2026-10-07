"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { CalendarEvent, CalendarEventType } from "@/types";

function toCalendarEventApiPayload(payload: Partial<CalendarEvent>) {
  const body: Record<string, unknown> = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.type) body.type = payload.type;
  if ("color" in payload) body.color = payload.color ?? null;
  if (payload.date) body.date = payload.date.split("T")[0];
  if (payload.startTime) body.startTime = payload.startTime;
  if (payload.endTime) body.endTime = payload.endTime;
  if (payload.projectId) body.projectId = payload.projectId;
  if (payload.clientId) body.clientId = payload.clientId;
  if (payload.priority) body.priority = payload.priority;
  if (payload.status) body.status = payload.status;
  if (payload.notes) body.notes = payload.notes;
  return body;
}

export function useCalendarEvents(from: string, to: string, type?: CalendarEventType) {
  return useQuery({
    queryKey: ["calendar", "events", from, to, type],
    queryFn: async () => {
      const { data } = await api.get<CalendarEvent[]>("/calendar/events", {
        params: { from, to, ...(type ? { type } : {}) },
      });
      return data;
    },
    enabled: !!from && !!to,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<CalendarEvent>) => {
      const { data } = await api.post<CalendarEvent>(
        "/calendar/events",
        toCalendarEventApiPayload(payload)
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Événement ajouté");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erreur lors de la création")),
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      silent: _silent,
      ...payload
    }: { id: string; silent?: boolean } & Partial<CalendarEvent>) => {
      const { data } = await api.patch<CalendarEvent>(
        `/calendar/events/${id}`,
        toCalendarEventApiPayload(payload)
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (!vars.silent) toast.success("Événement mis à jour");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erreur lors de la mise à jour")),
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/calendar/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Événement supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export type DayReorderItem = { source: "task" | "custom"; id: string };

function applyDayReorderToEvents(
  events: CalendarEvent[],
  items: DayReorderItem[]
): CalendarEvent[] {
  const orderMap = new Map<string, number>(
    items.map((item, index) => [`${item.source}:${item.id}`, index])
  );
  return events.map((ev) => {
    const key =
      ev.source === "task" && ev.sourceId
        ? `task:${ev.sourceId}`
        : ev.source === "custom"
          ? `custom:${ev.id}`
          : null;
    if (!key) return ev;
    const sortOrder = orderMap.get(key);
    if (sortOrder === undefined) return ev;
    return { ...ev, sortOrder };
  });
}

export function useReorderDayAgenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: DayReorderItem[]) => {
      const { data } = await api.post<{ reordered: number }>(
        "/calendar/events/reorder",
        { items }
      );
      return data;
    },
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: ["calendar"] });
      const previous = queryClient.getQueriesData<CalendarEvent[]>({
        queryKey: ["calendar", "events"],
      });
      queryClient.setQueriesData<CalendarEvent[]>(
        { queryKey: ["calendar", "events"] },
        (old) => (old ? applyDayReorderToEvents(old, items) : old)
      );
      return { previous };
    },
    onError: (_err, _items, ctx) => {
      if (ctx?.previous) {
        for (const [key, data] of ctx.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error("Impossible de réorganiser la journée");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
}
