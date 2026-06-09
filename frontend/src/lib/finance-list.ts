import type { Devis, DevisStatus, Invoice, InvoiceStatus } from "@/types";

export type FinanceTab = "devis" | "invoices";
export type FinanceTypeFilter = "all" | "devis" | "invoices";
export type FinancePeriodFilter = "all" | "month" | "year" | "custom";
export type FinanceSort =
  | "recent"
  | "oldest"
  | "amount_desc"
  | "amount_asc"
  | "client_asc"
  | "status";

export interface FinanceListFilters {
  query: string;
  typeFilter: FinanceTypeFilter;
  devisStatusFilter: DevisStatus | "all";
  invoiceStatusFilter: InvoiceStatus | "all";
  periodFilter: FinancePeriodFilter;
  customFrom?: string;
  customTo?: string;
  projectFilter: string | "all";
  clientFilter: string | "all";
  sort: FinanceSort;
}

function inPeriod(
  dateStr: string,
  period: FinancePeriodFilter,
  customFrom?: string,
  customTo?: string
): boolean {
  if (period === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();
  if (period === "month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }
  if (period === "year") {
    return date.getFullYear() === now.getFullYear();
  }
  if (period === "custom") {
    if (customFrom && date < new Date(customFrom)) return false;
    if (customTo) {
      const to = new Date(customTo);
      to.setHours(23, 59, 59, 999);
      if (date > to) return false;
    }
    return true;
  }
  return true;
}

function matchesQuery(
  query: string,
  fields: (string | number | null | undefined)[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) =>
    f != null && String(f).toLowerCase().includes(q)
  );
}

function sortDevis(list: Devis[], sort: FinanceSort): Devis[] {
  const copy = [...list];
  switch (sort) {
    case "oldest":
      return copy.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "amount_desc":
      return copy.sort((a, b) => b.totalTTC - a.totalTTC);
    case "amount_asc":
      return copy.sort((a, b) => a.totalTTC - b.totalTTC);
    case "client_asc":
      return copy.sort((a, b) =>
        (a.client?.name ?? "").localeCompare(b.client?.name ?? "", "fr")
      );
    case "status":
      return copy.sort((a, b) => a.status.localeCompare(b.status));
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

function sortInvoices(list: Invoice[], sort: FinanceSort): Invoice[] {
  const copy = [...list];
  switch (sort) {
    case "oldest":
      return copy.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "amount_desc":
      return copy.sort((a, b) => b.totalTTC - a.totalTTC);
    case "amount_asc":
      return copy.sort((a, b) => a.totalTTC - b.totalTTC);
    case "client_asc":
      return copy.sort((a, b) =>
        (a.client?.name ?? "").localeCompare(b.client?.name ?? "", "fr")
      );
    case "status":
      return copy.sort((a, b) => a.status.localeCompare(b.status));
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export function filterDevis(devis: Devis[], filters: FinanceListFilters): Devis[] {
  let list = devis.filter((d) => {
    if (filters.devisStatusFilter !== "all" && d.status !== filters.devisStatusFilter)
      return false;
    if (filters.projectFilter !== "all" && d.projectId !== filters.projectFilter)
      return false;
    if (filters.clientFilter !== "all" && d.clientId !== filters.clientFilter)
      return false;
    if (!inPeriod(d.createdAt, filters.periodFilter, filters.customFrom, filters.customTo))
      return false;
    return matchesQuery(filters.query, [
      d.number,
      d.client?.name,
      d.project?.name,
      d.object,
      d.status,
      d.totalHT,
      d.totalTTC,
    ]);
  });
  return sortDevis(list, filters.sort);
}

export function filterInvoices(
  invoices: Invoice[],
  filters: FinanceListFilters
): Invoice[] {
  let list = invoices.filter((inv) => {
    if (
      filters.invoiceStatusFilter !== "all" &&
      inv.status !== filters.invoiceStatusFilter
    )
      return false;
    if (filters.projectFilter !== "all" && inv.projectId !== filters.projectFilter)
      return false;
    if (filters.clientFilter !== "all" && inv.clientId !== filters.clientFilter)
      return false;
    if (
      !inPeriod(inv.issueDate ?? inv.createdAt, filters.periodFilter, filters.customFrom, filters.customTo)
    )
      return false;
    const remaining = inv.totalTTC - (inv.paidAmount ?? 0);
    return matchesQuery(filters.query, [
      inv.number,
      inv.client?.name,
      inv.project?.name,
      inv.object,
      inv.status,
      inv.totalHT,
      inv.totalTTC,
      inv.paidAmount,
      remaining,
    ]);
  });
  return sortInvoices(list, filters.sort);
}

export function invoiceRemaining(inv: Invoice): number {
  return Math.max(0, inv.totalTTC - (inv.paidAmount ?? 0));
}

export function computeTvaAmount(totalHT: number, totalTTC: number): number {
  return Math.round((totalTTC - totalHT) * 100) / 100;
}
