"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { invalidateFinanceQueries } from "@/lib/finance-query";
import type { Devis, DevisItem, Invoice } from "@/types";

export type DevisItemInput = Pick<
  DevisItem,
  "description" | "quantity" | "unitPrice" | "order"
>;

export type DevisInput = Partial<Omit<Devis, "items">> & {
  items?: DevisItemInput[];
};

export function useDevisList() {
  return useQuery({
    queryKey: ["devis"],
    queryFn: async () => {
      const { data } = await api.get<Devis[]>("/devis");
      return data;
    },
  });
}

export function useDevis(id: string) {
  return useQuery({
    queryKey: ["devis", id],
    queryFn: async () => {
      const { data } = await api.get<Devis>(`/devis/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDevis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (devis: DevisInput) => {
      const { data } = await api.post<Devis>("/devis", devis);
      return data;
    },
    onSuccess: () => {
      invalidateFinanceQueries(queryClient);
      toast.success("Devis créé");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erreur lors de la création")),
  });
}

export function useUpdateDevis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...devis }: { id: string } & DevisInput) => {
      const { data } = await api.patch<Devis>(`/devis/${id}`, devis);
      return data;
    },
    onSuccess: (_, variables) => {
      invalidateFinanceQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ["devis", variables.id] });
      toast.success("Devis mis à jour");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erreur lors de la mise à jour")),
  });
}

export function useDeleteDevis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/devis/${id}`);
    },
    onSuccess: () => {
      invalidateFinanceQueries(queryClient);
      toast.success("Devis supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useConvertDevisToInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<Invoice>(`/devis/${id}/convert-to-invoice`);
      return data;
    },
    onSuccess: () => {
      invalidateFinanceQueries(queryClient);
      toast.success("Facture créée depuis le devis");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Conversion impossible");
    },
  });
}

export function useDuplicateDevis() {
  const createDevis = useCreateDevis();

  return useMutation({
    mutationFn: async (devis: Devis) => {
      const { data: full } = await api.get<Devis>(`/devis/${devis.id}`);
      return createDevis.mutateAsync({
        clientId: full.clientId,
        projectId: full.projectId,
        object: full.object,
        status: "DRAFT",
        tva: full.tva,
        paymentTerms: full.paymentTerms,
        notes: full.notes,
        validUntil: full.validUntil,
        items: (full.items ?? []).map(({ description, quantity, unitPrice, order }) => ({
          description,
          quantity,
          unitPrice,
          order,
        })),
      });
    },
  });
}
