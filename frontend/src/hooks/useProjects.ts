"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { isAxiosError } from "axios";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { Project, ProjectCollaborator } from "@/types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get<Project[]>("/projects");
      return data;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data } = await api.get<Project>(`/projects/${id}`);
      return data;
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && [403, 404].includes(error.response?.status ?? 0)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const { data } = await api.post<Project>("/projects", project);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...project }: { id: string } & Partial<Project>) => {
      const { data } = await api.patch<Project>(`/projects/${id}`, project);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast.success("Projet mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.removeQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast.success("Projet supprimé");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erreur lors de la suppression")),
  });
}

export function useAddProjectCollaborator(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post<ProjectCollaborator[]>(
        `/projects/${projectId}/collaborators`,
        { email },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Impossible d'inviter ce collaborateur")),
  });
}

export function useRemoveProjectCollaborator(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete<ProjectCollaborator[]>(
        `/projects/${projectId}/collaborators/${userId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Collaborateur retiré");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Impossible de retirer ce collaborateur")),
  });
}
