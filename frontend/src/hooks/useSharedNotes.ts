"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type {
  Client,
  Devis,
  Document,
  Invoice,
  Payment,
  PlanRender,
  Project,
  SharedNote,
  SharedNoteRefKind,
  Task,
  Tender,
} from "@/types";

const notesKey = ["shared-notes"] as const;

export type SharedNoteRefDraft = {
  kind: SharedNoteRefKind;
  entityId: string;
  title: string;
  subtitle?: string;
  href: string;
};

export type SharedNoteDraft = {
  content: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  refs?: SharedNoteRefDraft[];
  files?: File[];
  removeFileIds?: string[];
};

export function refFromClient(
  client: Pick<Client, "id" | "name" | "phone" | "email">
): SharedNoteRefDraft {
  return {
    kind: "CLIENT",
    entityId: client.id,
    title: client.name,
    subtitle: [client.phone, client.email].filter(Boolean).join(" · ") || undefined,
    href: `/clients/${client.id}`,
  };
}

export function refFromProject(project: Pick<Project, "id" | "name" | "city">): SharedNoteRefDraft {
  return {
    kind: "PROJECT",
    entityId: project.id,
    title: project.name,
    subtitle: project.city ?? undefined,
    href: `/projects/${project.id}`,
  };
}

export function refFromDocument(doc: Pick<Document, "id" | "name" | "type">): SharedNoteRefDraft {
  return {
    kind: "DOCUMENT",
    entityId: doc.id,
    title: doc.name,
    subtitle: doc.type,
    href: "/documents",
  };
}

export function refFromPlanRender(asset: Pick<PlanRender, "id" | "name" | "kind">): SharedNoteRefDraft {
  return {
    kind: asset.kind === "PLAN" ? "PLAN" : "RENDER",
    entityId: asset.id,
    title: asset.name,
    subtitle: asset.kind === "PLAN" ? "Plan" : "Image",
    href: "/plans-renders",
  };
}

export function refFromDevis(
  devis: Pick<Devis, "id" | "number" | "clientName" | "object" | "totalTTC">
): SharedNoteRefDraft {
  return {
    kind: "DEVIS",
    entityId: devis.id,
    title: devis.number,
    subtitle: [devis.object, devis.clientName, formatCurrency(devis.totalTTC)].filter(Boolean).join(" · "),
    href: `/devis/${devis.id}`,
  };
}

export function refFromInvoice(
  invoice: Pick<Invoice, "id" | "number" | "clientName" | "object" | "totalTTC">
): SharedNoteRefDraft {
  return {
    kind: "INVOICE",
    entityId: invoice.id,
    title: invoice.number,
    subtitle: [invoice.object, invoice.clientName, formatCurrency(invoice.totalTTC)]
      .filter(Boolean)
      .join(" · "),
    href: `/invoices/${invoice.id}`,
  };
}

export function refFromPayment(
  payment: Pick<Payment, "id" | "reference" | "clientName" | "amount" | "invoiceName">
): SharedNoteRefDraft {
  return {
    kind: "PAYMENT",
    entityId: payment.id,
    title: payment.reference?.trim() || payment.invoiceName || "Paiement",
    subtitle: [payment.clientName, formatCurrency(payment.amount)].filter(Boolean).join(" · "),
    href: "/payments",
  };
}

export function refFromTask(task: Pick<Task, "id" | "title" | "projectName" | "project">): SharedNoteRefDraft {
  return {
    kind: "TASK",
    entityId: task.id,
    title: task.title,
    subtitle: task.projectName ?? task.project?.name ?? undefined,
    href: "/tasks",
  };
}

export function refFromTender(tender: Pick<Tender, "id" | "name" | "client">): SharedNoteRefDraft {
  return {
    kind: "TENDER",
    entityId: tender.id,
    title: tender.name,
    subtitle: tender.client ?? undefined,
    href: "/tenders",
  };
}

export function draftFromClient(client: Pick<Client, "id" | "name" | "phone" | "email">): SharedNoteDraft {
  return { content: "", refs: [refFromClient(client)] };
}

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

function toFormData(draft: SharedNoteDraft) {
  const form = new FormData();
  form.append("content", draft.content);
  form.append("contactName", draft.contactName ?? "");
  form.append("contactPhone", draft.contactPhone ?? "");
  form.append("contactEmail", draft.contactEmail ?? "");
  form.append(
    "refs",
    JSON.stringify((draft.refs ?? []).map((ref) => ({ kind: ref.kind, entityId: ref.entityId })))
  );
  for (const file of draft.files ?? []) form.append("files", file);
  return form;
}

export function useSharedNotes() {
  return useQuery({
    queryKey: notesKey,
    queryFn: async () => {
      const { data } = await api.get<SharedNote[]>("/shared-notes");
      return data;
    },
  });
}

export function useCreateSharedNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: SharedNoteDraft) => {
      const { data } = await api.post<SharedNote>("/shared-notes", toFormData(draft), multipart);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKey });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Partagé avec le cabinet");
    },
    onError: () => toast.error("Impossible de partager"),
  });
}

export function useUpdateSharedNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...draft }: SharedNoteDraft & { id: string }) => {
      if (draft.files?.length) {
        const form = new FormData();
        for (const file of draft.files) form.append("files", file);
        await api.post(`/shared-notes/${id}/files`, form, multipart);
      }
      for (const fileId of draft.removeFileIds ?? []) {
        await api.delete(`/shared-notes/${id}/files/${fileId}`);
      }
      const { data } = await api.patch<SharedNote>(`/shared-notes/${id}`, {
        content: draft.content,
        contactName: draft.contactName,
        contactPhone: draft.contactPhone,
        contactEmail: draft.contactEmail,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKey });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Note mise à jour");
    },
    onError: () => toast.error("Impossible de modifier la note"),
  });
}

export function useDeleteSharedNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/shared-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKey });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Note supprimée");
    },
    onError: () => toast.error("Impossible de supprimer la note"),
  });
}
