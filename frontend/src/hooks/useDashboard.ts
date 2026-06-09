"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import type {
  DashboardOverview,
  Deadline,
  Meeting,
  Priority,
  Task,
  TaskStatus,
} from "@/types";

const dashboardKey = ["dashboard", "overview"] as const;

export function useDashboardOverview() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: dashboardKey,
    queryFn: async () => {
      const { data } = await api.get<DashboardOverview>("/dashboard/overview");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      return {
        ...data,
        smartAlerts: data.smartAlerts ?? [],
      };
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

function invalidateDashboard(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: dashboardKey });
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["calendar"] });
  queryClient.invalidateQueries({ queryKey: ["projects"] });
}

export function useCreateDashboardTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      dueDate?: string;
      scheduledAt?: string;
      projectId?: string;
      priority?: Priority;
      notes?: string;
      description?: string;
    }) => {
      const { data } = await api.post<Task>("/tasks", payload);
      return data;
    },
    onSuccess: () => {
      invalidateDashboard(queryClient);
      toast.success("Tâche ajoutée");
    },
    onError: () => toast.error("Impossible d'ajouter la tâche"),
  });
}

export function useUpdateDashboardTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data } = await api.patch<Task>(`/tasks/${id}`, { status });
      return data;
    },
    onSuccess: () => invalidateDashboard(queryClient),
    onError: () => toast.error("Impossible de mettre à jour la tâche"),
  });
}

export function useCreateDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      date: string;
      projectId?: string;
      priority?: Priority;
    }) => {
      const { data } = await api.post<Deadline>("/deadlines", payload);
      return data;
    },
    onSuccess: () => {
      invalidateDashboard(queryClient);
      toast.success("Deadline créée");
    },
    onError: () => toast.error("Impossible de créer la deadline"),
  });
}

export function useUpdateDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      done,
      title,
      date,
    }: {
      id: string;
      done?: boolean;
      title?: string;
      date?: string;
    }) => {
      const { data } = await api.patch<Deadline>(`/deadlines/${id}`, {
        done,
        title,
        date,
      });
      return data;
    },
    onSuccess: () => {
      invalidateDashboard(queryClient);
      toast.success("Deadline mise à jour");
    },
    onError: () => toast.error("Erreur deadline"),
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      date: string;
      startTime?: string;
      endTime?: string;
      location?: string;
      notes?: string;
      projectId?: string;
    }) => {
      const { data } = await api.post<Meeting>("/meetings", payload);
      return data;
    },
    onSuccess: () => {
      invalidateDashboard(queryClient);
      toast.success("Réunion planifiée");
    },
    onError: () => toast.error("Impossible de créer la réunion"),
  });
}

export async function downloadWeeklySummaryPdf() {
  const response = await api.get("/dashboard/weekly-summary/pdf", {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume-hebdo-${new Date().toISOString().slice(0, 10)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
