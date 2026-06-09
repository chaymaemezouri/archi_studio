import type { Payment, Project } from "@/types";

type ClientRef = { id: string; name: string } | null | undefined;

function projectClient(project?: {
  clientId?: string | null;
  client?: ClientRef;
} | null): ClientRef {
  if (!project) return null;
  return project.client ?? null;
}

export function getPaymentClientName(payment: Payment, projects: Project[] = []): string {
  if (payment.client?.name) return payment.client.name;
  if (payment.invoice?.client?.name) return payment.invoice.client.name;
  if (projectClient(payment.project)?.name) return projectClient(payment.project)!.name;
  if (projectClient(payment.invoice?.project)?.name) {
    return projectClient(payment.invoice?.project)!.name;
  }

  const projectId = payment.projectId ?? payment.invoice?.projectId;
  if (projectId) {
    const project = projects.find((item) => item.id === projectId);
    if (project?.client?.name) return project.client.name;
  }

  return "—";
}

export function getPaymentClientId(payment: Payment, projects: Project[] = []): string | undefined {
  if (payment.clientId) return payment.clientId;
  if (payment.client?.id) return payment.client.id;
  if (payment.invoice?.clientId) return payment.invoice.clientId;
  if (payment.invoice?.client?.id) return payment.invoice.client.id;
  if (payment.project?.clientId) return payment.project.clientId;
  if (payment.project?.client?.id) return payment.project.client.id;
  if (payment.invoice?.project?.clientId) return payment.invoice.project.clientId;
  if (payment.invoice?.project?.client?.id) return payment.invoice.project.client.id;

  const projectId = payment.projectId ?? payment.invoice?.projectId;
  if (projectId) {
    const project = projects.find((item) => item.id === projectId);
    return project?.clientId ?? project?.client?.id ?? undefined;
  }

  return undefined;
}

export function getInvoiceFinanceHref(invoiceId: string): string {
  return `/finances/quotes-invoices?edit=invoice&id=${encodeURIComponent(invoiceId)}`;
}
