"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import type { Tender } from "@/types";

export function useTenders() {
  return useQuery({
    queryKey: ["tenders"],
    queryFn: async () => {
      const { data } = await api.get<Tender[]>("/tenders");
      return data;
    },
  });
}

export function useCreateTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tender: Partial<Tender>) => {
      const { data } = await api.post<Tender>("/tenders", tender);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      toast.success("Appel d'offres créé");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useUpdateTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tender }: { id: string } & Partial<Tender>) => {
      const { data } = await api.patch<Tender>(`/tenders/${id}`, tender);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      toast.success("Appel d'offres mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}
