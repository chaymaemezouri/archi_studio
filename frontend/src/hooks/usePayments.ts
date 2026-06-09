"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import type { Payment } from "@/types";

export type PaymentInput = {
  invoiceId?: string;
  clientId?: string;
  projectId?: string;
  amount: number;
  date: string;
  method: Payment["method"];
  reference?: string;
  notes?: string;
  proofUrl?: string;
};

export function usePayments(params?: {
  invoiceId?: string;
  clientId?: string;
  projectId?: string;
  method?: Payment["method"];
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: async () => {
      const { data } = await api.get<Payment[]>("/payments", {
        params,
      });
      return data;
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: PaymentInput) => {
      const { data } = await api.post<Payment>("/payments", payment);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Paiement enregistré");
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payment }: { id: string } & Partial<PaymentInput>) => {
      const { data } = await api.patch<Payment>(`/payments/${id}`, payment);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Paiement mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Paiement supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}
