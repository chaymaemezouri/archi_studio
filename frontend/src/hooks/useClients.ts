"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import type { Client, ClientDocument, ClientNote } from "@/types";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await api.get<Client[]>("/clients");
      return data;
    },
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: async () => {
      const { data } = await api.get<Client>(`/clients/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: Partial<Client>) => {
      const { data } = await api.post<Client>("/clients", client);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...client }: { id: string } & Partial<Client>) => {
      const { data } = await api.patch<Client>(`/clients/${id}`, client);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", variables.id] });
      toast.success("Client mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useArchiveClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<Client>(`/clients/${id}/archive`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", id] });
      toast.success("Client archivé");
    },
    onError: () => toast.error("Erreur lors de l'archivage"),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useCreateClientNote(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post<ClientNote>(`/clients/${clientId}/notes`, {
        content,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", clientId] });
      toast.success("Note ajoutée");
    },
    onError: () => toast.error("Erreur lors de l'ajout de la note"),
  });
}

export function useUpdateClientNote(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      const { data } = await api.patch<ClientNote>(
        `/clients/${clientId}/notes/${noteId}`,
        { content }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", clientId] });
      toast.success("Note mise à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeleteClientNote(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/clients/${clientId}/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", clientId] });
      toast.success("Note supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useCreateClientDocument(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      url: string;
      mimeType: string;
      size: number;
      docType?: string;
    }) => {
      const { data } = await api.post<ClientDocument>(
        `/clients/${clientId}/documents`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", clientId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document ajouté");
    },
    onError: () => toast.error("Erreur lors de l'ajout du document"),
  });
}

export function useDeleteClientDocument(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docId: string) => {
      await api.delete(`/clients/${clientId}/documents/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", clientId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}
