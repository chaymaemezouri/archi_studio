"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { toTaskApiPayload } from "@/lib/task-payload";
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
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
  queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Task>) => {
      const { data } = await api.post<Task>("/tasks", toTaskApiPayload(payload));
      return data;
    },
    onSuccess: () => {
      invalidateTasks(queryClient);
      toast.success("Tâche créée");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erreur lors de la création")),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      silent: _silent,
      ...payload
    }: { id: string; silent?: boolean } & Partial<Task>) => {
      const { data } = await api.patch<Task>(
        `/tasks/${id}`,
        toTaskApiPayload(payload)
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      invalidateTasks(queryClient);
      if (!vars.silent) toast.success("Tâche mise à jour");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erreur lors de la mise à jour")),
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await api.post<{ reordered: number }>("/tasks/reorder", {
        ids,
      });
      return data;
    },
    onSuccess: () => {
      invalidateTasks(queryClient);
    },
    onError: () => toast.error("Impossible de réorganiser les tâches"),
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
      const { data } = await api.post<Task>(
        "/tasks",
        toTaskApiPayload({
          title: `${task.title} (copie)`,
          description: task.description ?? undefined,
          projectId: task.projectId,
          clientId: task.clientId,
          dueDate: task.dueDate ?? undefined,
          priority: task.priority,
          status: "TODO",
          notes: task.notes ?? undefined,
          color: task.color ?? null,
        })
      );
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
