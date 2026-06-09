"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import type { Deadline } from "@/types";

export function useDeadlines(projectId?: string) {
  return useQuery({
    queryKey: ["deadlines", projectId],
    queryFn: async () => {
      const { data } = await api.get<Deadline[]>("/deadlines", {
        params: projectId ? { projectId } : undefined,
      });
      return data;
    },
  });
}

export function useCreateDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deadline: Partial<Deadline>) => {
      const { data } = await api.post<Deadline>("/deadlines", deadline);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      toast.success("Deadline créée");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useUpdateDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...deadline }: { id: string } & Partial<Deadline>) => {
      const { data } = await api.patch<Deadline>(`/deadlines/${id}`, deadline);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      toast.success("Deadline mise à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeleteDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/deadlines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadlines"] });
      toast.success("Deadline supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}
