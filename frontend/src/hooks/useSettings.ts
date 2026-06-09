"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";

export interface AppSettings {
  id: string;
  companyName?: string | null;
  companyAddress?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  siret?: string | null;
  tvaNumber?: string | null;
  logoUrl?: string | null;
  defaultTva?: number | null;
  invoicePrefix?: string | null;
  devisPrefix?: string | null;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await api.get<AppSettings>("/settings");
      return data;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<AppSettings>) => {
      const { data } = await api.patch<AppSettings>("/settings", settings);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Paramètres enregistrés");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
}
