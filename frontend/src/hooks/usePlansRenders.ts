"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import {
  uploadPlanRenderFile,
  type PlanRenderUploadMeta,
} from "@/lib/plan-render-upload";
import type { PlanRender } from "@/types";

export function usePlansRenders(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ["plans-renders", "project", projectId] : ["plans-renders"],
    queryFn: async () => {
      const { data } = await api.get<PlanRender[]>("/plans-renders", {
        params: projectId ? { projectId } : undefined,
      });
      return data;
    },
  });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["plans-renders"] });
  queryClient.invalidateQueries({ queryKey: ["projects"] });
}

export function useUploadPlanRender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, ...meta }: PlanRenderUploadMeta & { file: File }) =>
      uploadPlanRenderFile(file, meta),
    onSuccess: (_, vars) => {
      invalidateAll(queryClient);
      toast.success(vars.kind === "PLAN" ? "Plan ajouté" : "Rendu ajouté");
    },
    onError: () => toast.error("Impossible d'ajouter ce fichier"),
  });
}

export function useUpdatePlanRender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<PlanRender>) => {
      const { data } = await api.patch<PlanRender>(`/plans-renders/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Informations mises à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeletePlanRender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/plans-renders/${id}`);
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Élément supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useSetMainImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<PlanRender>(`/plans-renders/${id}/main-image`);
      return data;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Image principale définie");
    },
    onError: () => toast.error("Impossible de définir l'image principale"),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { data } = await api.patch<PlanRender>(`/plans-renders/${id}`, { isFavorite });
      return data;
    },
    onSuccess: () => invalidateAll(queryClient),
    onError: () => toast.error("Erreur favori"),
  });
}
