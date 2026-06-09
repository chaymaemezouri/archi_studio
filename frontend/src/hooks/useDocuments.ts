"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { uploadDocumentFile, type DocumentUploadMeta } from "@/lib/document-upload";
import type { Document } from "@/types";

export function useDocuments(projectId?: string, clientId?: string) {
  return useQuery({
    queryKey: projectId
      ? ["documents", "project", projectId]
      : clientId
        ? ["documents", "client", clientId]
        : ["documents"],
    queryFn: async () => {
      const { data } = await api.get<Document[]>("/documents", {
        params: {
          ...(projectId ? { projectId } : {}),
          ...(clientId ? { clientId } : {}),
        },
      });
      return data;
    },
  });
}

function invalidateDocuments(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["documents"] });
  queryClient.invalidateQueries({ queryKey: ["projects"] });
  queryClient.invalidateQueries({ queryKey: ["clients"] });
  queryClient.invalidateQueries({ queryKey: ["project-files"] });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, ...meta }: DocumentUploadMeta & { file: File }) =>
      uploadDocumentFile(file, meta),
    onSuccess: () => {
      invalidateDocuments(queryClient);
      toast.success("Document ajouté");
    },
    onError: () => toast.error("Impossible d'ajouter ce document"),
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Document>) => {
      const { data } = await api.patch<Document>(`/documents/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      invalidateDocuments(queryClient);
      toast.success("Document mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      invalidateDocuments(queryClient);
      toast.success("Document supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}
