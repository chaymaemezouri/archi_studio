"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import ClientCardMenu from "./ClientCardMenu";
import ClientQuickContactActions, { clientDisplayCompany } from "./ClientQuickContactActions";
import { CLIENT_STATUS_LABELS, CLIENT_TYPE_LABELS, type Client } from "@/types";
import { clientsListRowContactLink } from "./clients-list-ui";
import { cn, formatCurrency } from "@/lib/utils";

interface ClientListRowProps {
  client: Client;
  onEdit?: (client: Client) => void;
}

function statusVariant(status?: string): "default" | "success" | "warning" {
  if (status === "ACTIVE") return "success";
  if (status === "ARCHIVED") return "warning";
  return "default";
}

export function ClientListHeader() {
  return (
    <div className="hidden grid-cols-[1.15fr_0.65fr_0.95fr_1fr_0.55fr_0.45fr_0.55fr_0.55fr_2.2rem] gap-2 border-b border-[#8ba4c7]/[0.06] px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-[#8ba4c7]/40 md:grid">
      <span>Client</span>
      <span>Type</span>
      <span>Téléphone</span>
      <span>Email</span>
      <span>Ville</span>
      <span>Projets</span>
      <span>Statut</span>
      <span>Finance</span>
      <span />
    </div>
  );
}

export default function ClientListRow({ client, onEdit }: ClientListRowProps) {
  const company = clientDisplayCompany(client);
  const projectsCount = client.projectsCount ?? client._count?.projects ?? 0;
  const phone = client.phone?.trim();
  const email = client.email?.trim();
  const financeHint =
    (client.unpaidInvoicesCount ?? 0) > 0
      ? `${client.unpaidInvoicesCount} imp.`
      : (client.remainingAmount ?? 0) > 0
        ? formatCurrency(client.remainingAmount ?? 0)
        : "—";

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 border-b border-[#8ba4c7]/[0.05] px-4 py-2.5 text-[13px] transition last:border-b-0 hover:bg-[#8ba4c7]/[0.04]",
        "md:grid-cols-[1.15fr_0.65fr_0.95fr_1fr_0.55fr_0.45fr_0.55fr_0.55fr_2.2rem] md:items-center md:gap-2"
      )}
    >
      <div className="min-w-0">
        <span className="text-[10px] text-[#8ba4c7]/40 md:hidden">Client · </span>
        <Link
          href={`/clients/${client.id}`}
          className="font-medium text-[#e8edf4]/88 transition hover:text-[#b8cfe8]/95"
        >
          {client.name}
        </Link>
        {company && (
          <p className="truncate text-[11px] text-[#9aa3b0]/50">{company}</p>
        )}
        <div className="mt-1 md:hidden">
          <ClientQuickContactActions client={client} stopPropagation={false} />
        </div>
      </div>

      <span className="text-[#9aa3b0]/65">
        <span className="text-[10px] text-[#8ba4c7]/40 md:hidden">Type · </span>
        {CLIENT_TYPE_LABELS[client.type ?? ""] ?? "—"}
      </span>

      <span className="min-w-0">
        <span className="text-[10px] text-[#8ba4c7]/40 md:hidden">Tél · </span>
        {phone ? (
          <a href={`tel:${phone.replace(/\s/g, "")}`} className={clientsListRowContactLink}>
            {phone}
          </a>
        ) : (
          <span className="text-[#9aa3b0]/40">—</span>
        )}
      </span>

      <span className="min-w-0 truncate">
        <span className="text-[10px] text-[#8ba4c7]/40 md:hidden">Email · </span>
        {email ? (
          <a href={`mailto:${email}`} className={clientsListRowContactLink}>
            {email}
          </a>
        ) : (
          <span className="text-[#9aa3b0]/40">—</span>
        )}
      </span>

      <span className="text-[#9aa3b0]/65">
        <span className="text-[10px] text-[#8ba4c7]/40 md:hidden">Ville · </span>
        {client.city || "—"}
      </span>

      <span className="text-[#9aa3b0]/65">
        <span className="text-[10px] text-[#8ba4c7]/40 md:hidden">Projets · </span>
        {projectsCount}
      </span>

      <span>
        <Badge variant={statusVariant(client.status)}>
          {CLIENT_STATUS_LABELS[client.status ?? "ACTIVE"]}
        </Badge>
      </span>

      <span
        className={cn(
          "text-[11px]",
          (client.unpaidInvoicesCount ?? 0) > 0 ? "text-amber-400/85" : "text-[#8ba4c7]/40"
        )}
      >
        {financeHint}
      </span>

      <div className="flex items-center justify-end gap-0.5">
        <div className="hidden md:flex">
          <ClientQuickContactActions client={client} />
        </div>
        <ClientCardMenu client={client} onEdit={() => onEdit?.(client)} />
      </div>
    </div>
  );
}
