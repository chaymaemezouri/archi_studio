"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import type { CalendarEvent, CalendarEventType } from "@/types";

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
      const { data } = await api.post<CalendarEvent>("/calendar/events", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Événement ajouté");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<CalendarEvent>) => {
      const { data } = await api.patch<CalendarEvent>(`/calendar/events/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Événement mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
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
