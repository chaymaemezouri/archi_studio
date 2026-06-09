"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import type { Task, TaskStatus } from "@/types";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await api.get<Task[]>("/tasks");
      return data;
    },
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const { data } = await api.get<Task>(`/tasks/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

function invalidateTasks(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["projects"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
  queryClient.invalidateQueries({ queryKey: ["calendar"] });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Task>) => {
      const { data } = await api.post<Task>("/tasks", payload);
      return data;
    },
    onSuccess: () => {
      invalidateTasks(queryClient);
      toast.success("Tâche créée");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Task>) => {
      const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      invalidateTasks(queryClient);
      toast.success("Tâche mise à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<Task>(`/tasks/${id}/complete`);
      return data;
    },
    onSuccess: () => {
      invalidateTasks(queryClient);
      toast.success("Tâche terminée");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data } = await api.patch<Task>(`/tasks/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      invalidateTasks(queryClient);
    },
    onError: () => toast.error("Erreur lors du changement de statut"),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      invalidateTasks(queryClient);
      toast.success("Tâche supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useDuplicateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      const { data } = await api.post<Task>("/tasks", {
        title: `${task.title} (copie)`,
        description: task.description,
        projectId: task.projectId,
        clientId: task.clientId,
        dueDate: task.dueDate,
        priority: task.priority,
        status: "TODO",
        notes: task.notes,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Tâche dupliquée");
    },
    onError: () => toast.error("Erreur lors de la duplication"),
  });
}
