import { getFinanceProjectLabel } from "@/lib/finance-entity-utils";
import type { Devis, Invoice, Payment } from "@/types";

export interface FinanceProjectGroup<T> {
  key: string;
  projectId: string | null;
  projectName: string;
  items: T[];
  totalAmount?: number;
}

function financeGroupKey(projectId: string | null | undefined): string {
  return projectId ? `project:${projectId}` : "unclassified";
}

function sortGroups<T>(
  groups: FinanceProjectGroup<T>[]
): FinanceProjectGroup<T>[] {
  return groups.sort((a, b) => {
    const aUnclassified = a.key === "unclassified";
    const bUnclassified = b.key === "unclassified";
    if (aUnclassified && !bUnclassified) return 1;
    if (!aUnclassified && bUnclassified) return -1;
    return a.projectName.localeCompare(b.projectName, "fr");
  });
}

function getPaymentProjectId(payment: Payment): string | null {
  return payment.projectId ?? payment.invoice?.projectId ?? payment.project?.id ?? null;
}

function getPaymentProjectName(payment: Payment): string {
  return (
    payment.project?.name ??
    payment.projectName ??
    payment.invoice?.project?.name ??
    payment.invoice?.projectName ??
    "Sans projet"
  );
}

export function groupPaymentsByProject(
  items: Payment[]
): FinanceProjectGroup<Payment>[] {
  const map = new Map<string, FinanceProjectGroup<Payment>>();

  for (const payment of items) {
    const projectId = getPaymentProjectId(payment);
    const key = financeGroupKey(projectId);
    if (!map.has(key)) {
      map.set(key, {
        key,
        projectId,
        projectName: getPaymentProjectName(payment),
        items: [],
        totalAmount: 0,
      });
    }
    const group = map.get(key)!;
    group.items.push(payment);
    group.totalAmount = (group.totalAmount ?? 0) + payment.amount;
  }

  return sortGroups(Array.from(map.values()));
}

function getDevisProjectId(d: Devis): string | null {
  return d.projectId ?? d.project?.id ?? null;
}

export function groupDevisByProject(items: Devis[]): FinanceProjectGroup<Devis>[] {
  const map = new Map<string, FinanceProjectGroup<Devis>>();

  for (const devis of items) {
    const projectId = getDevisProjectId(devis);
    const key = financeGroupKey(projectId);
    if (!map.has(key)) {
      map.set(key, {
        key,
        projectId,
        projectName: getFinanceProjectLabel(devis) === "—" ? "Sans projet" : getFinanceProjectLabel(devis),
        items: [],
        totalAmount: 0,
      });
    }
    const group = map.get(key)!;
    group.items.push(devis);
    group.totalAmount = (group.totalAmount ?? 0) + devis.totalTTC;
  }

  return sortGroups(Array.from(map.values()));
}

function getInvoiceProjectId(inv: Invoice): string | null {
  return inv.projectId ?? inv.project?.id ?? null;
}

export function groupInvoicesByProject(
  items: Invoice[]
): FinanceProjectGroup<Invoice>[] {
  const map = new Map<string, FinanceProjectGroup<Invoice>>();

  for (const invoice of items) {
    const projectId = getInvoiceProjectId(invoice);
    const key = financeGroupKey(projectId);
    if (!map.has(key)) {
      map.set(key, {
        key,
        projectId,
        projectName:
          getFinanceProjectLabel(invoice) === "—"
            ? "Sans projet"
            : getFinanceProjectLabel(invoice),
        items: [],
        totalAmount: 0,
      });
    }
    const group = map.get(key)!;
    group.items.push(invoice);
    group.totalAmount = (group.totalAmount ?? 0) + invoice.totalTTC;
  }

  return sortGroups(Array.from(map.values()));
}
