import type { Client, ClientStatus, ClientType } from "@/types";

export type ClientsStatusFilter = "all" | ClientStatus;
export type ClientsTypeFilter = "all" | ClientType;
export type ClientsRelationFilter = "all" | "with_projects" | "without_projects";
export type ClientsFinanceFilter =
  | "all"
  | "pending_quotes"
  | "unpaid_invoices";

export type ClientsSort =
  | "recent"
  | "oldest"
  | "name"
  | "name_desc"
  | "activity"
  | "projects"
  | "remaining";

function normalize(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().trim();
}

export function searchClients(clients: Client[], query: string): Client[] {
  const q = query.trim().toLowerCase();
  if (!q) return clients;

  return clients.filter((c) => {
    const haystack = [
      c.name,
      c.company,
      c.email,
      c.phone,
      c.secondaryPhone,
      c.city,
      c.country,
      ...(c.projectNames ?? []),
    ]
      .map(normalize)
      .join(" ");
    return haystack.includes(q) || haystack.split(/\s+/).some((w) => w.startsWith(q));
  });
}

export function applyClientsStatusFilter(
  clients: Client[],
  filter: ClientsStatusFilter
): Client[] {
  if (filter === "all") return clients;
  return clients.filter((c) => (c.status ?? "ACTIVE") === filter);
}

export function applyClientsTypeFilter(
  clients: Client[],
  filter: ClientsTypeFilter
): Client[] {
  if (filter === "all") return clients;
  return clients.filter((c) => c.type === filter);
}

export function applyClientsRelationFilter(
  clients: Client[],
  filter: ClientsRelationFilter
): Client[] {
  if (filter === "all") return clients;
  if (filter === "with_projects") {
    return clients.filter((c) => (c.projectsCount ?? c._count?.projects ?? 0) > 0);
  }
  return clients.filter((c) => (c.projectsCount ?? c._count?.projects ?? 0) === 0);
}

export function applyClientsFinanceFilter(
  clients: Client[],
  filter: ClientsFinanceFilter
): Client[] {
  if (filter === "all") return clients;
  if (filter === "pending_quotes") {
    return clients.filter((c) => (c.pendingQuotesCount ?? 0) > 0);
  }
  return clients.filter((c) => (c.unpaidInvoicesCount ?? 0) > 0);
}

export function sortClients(clients: Client[], sort: ClientsSort): Client[] {
  const list = [...clients];

  switch (sort) {
    case "oldest":
      return list.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    case "name_desc":
      return list.sort((a, b) => b.name.localeCompare(a.name, "fr"));
    case "activity":
      return list.sort(
        (a, b) =>
          new Date(b.lastActivityAt ?? b.updatedAt).getTime() -
          new Date(a.lastActivityAt ?? a.updatedAt).getTime()
      );
    case "projects":
      return list.sort(
        (a, b) =>
          (b.projectsCount ?? b._count?.projects ?? 0) -
          (a.projectsCount ?? a._count?.projects ?? 0)
      );
    case "remaining":
      return list.sort(
        (a, b) => (b.remainingAmount ?? 0) - (a.remainingAmount ?? 0)
      );
    case "recent":
    default:
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export function filterAndSortClients(
  clients: Client[],
  options: {
    query: string;
    statusFilter: ClientsStatusFilter;
    typeFilter: ClientsTypeFilter;
    relationFilter: ClientsRelationFilter;
    financeFilter: ClientsFinanceFilter;
    sort: ClientsSort;
  }
): Client[] {
  let list = searchClients(clients, options.query);
  list = applyClientsStatusFilter(list, options.statusFilter);
  list = applyClientsTypeFilter(list, options.typeFilter);
  list = applyClientsRelationFilter(list, options.relationFilter);
  list = applyClientsFinanceFilter(list, options.financeFilter);
  return sortClients(list, options.sort);
}
