"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { invalidateFinanceQueries } from "@/lib/finance-query";
import type { Invoice, InvoiceItem } from "@/types";

export type InvoiceItemInput = Pick<
  InvoiceItem,
  "description" | "quantity" | "unitPrice" | "order"
>;

export type InvoiceInput = Partial<Omit<Invoice, "items">> & {
  items?: InvoiceItemInput[];
};

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await api.get<Invoice[]>("/invoices");
      return data;
    },
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const { data } = await api.get<Invoice>(`/invoices/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useInvoiceStats() {
  const { data: invoices } = useInvoices();

  return useQuery({
    queryKey: ["invoices", "stats", invoices?.length],
    queryFn: async () => {
      const list = invoices ?? [];
      const paid = list
        .filter((i) => i.status === "PAID")
        .reduce((sum, i) => sum + i.totalTTC, 0);
      const pending = list
        .filter((i) => ["SENT", "UNPAID", "PARTIAL"].includes(i.status))
        .reduce((sum, i) => sum + (i.totalTTC - i.paidAmount), 0);
      const overdue = list
        .filter((i) => i.status === "OVERDUE")
        .reduce((sum, i) => sum + (i.totalTTC - i.paidAmount), 0);

      return { total: list.length, paid, pending, overdue };
    },
    enabled: invoices !== undefined,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: InvoiceInput) => {
      const { data } = await api.post<Invoice>("/invoices", invoice);
      return data;
    },
    onSuccess: () => {
      invalidateFinanceQueries(queryClient);
      toast.success("Facture créée");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erreur lors de la création")),
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...invoice }: { id: string } & InvoiceInput) => {
      const { data } = await api.patch<Invoice>(`/invoices/${id}`, invoice);
      return data;
    },
    onSuccess: (_, variables) => {
      invalidateFinanceQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
      toast.success("Facture mise à jour");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erreur lors de la mise à jour")),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/invoices/${id}`);
    },
    onSuccess: () => {
      invalidateFinanceQueries(queryClient);
      toast.success("Facture supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useDuplicateInvoice() {
  const createInvoice = useCreateInvoice();

  return useMutation({
    mutationFn: async (invoice: Invoice) => {
      const { data: full } = await api.get<Invoice>(`/invoices/${invoice.id}`);
      return createInvoice.mutateAsync({
        clientId: full.clientId,
        projectId: full.projectId,
        object: full.object,
        status: "DRAFT",
        tva: full.tva,
        paymentMethod: full.paymentMethod,
        bankTransferBy: full.bankTransferBy,
        notes: full.notes,
        issueDate: new Date().toISOString(),
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
