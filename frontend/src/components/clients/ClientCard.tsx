"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import ClientCardMenu from "./ClientCardMenu";
import ClientQuickContactActions, { clientDisplayCompany } from "./ClientQuickContactActions";
import {
  CLIENT_STATUS_LABELS,
  CLIENT_TYPE_LABELS,
  type Client,
} from "@/types";
import {
  clientsListCard,
  clientsListCardBody,
  clientsListCardFinance,
  clientsListCardFooter,
  clientsListCardHeader,
  clientsListCardMeta,
  clientsListCardStats,
} from "@/components/clients/clients-list-ui";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";

interface ClientCardProps {
  client: Client;
  onEdit?: (client: Client) => void;
}

function statusVariant(status?: string): "default" | "success" | "warning" {
  if (status === "ACTIVE") return "success";
  if (status === "ARCHIVED") return "warning";
  return "default";
}

export default function ClientCard({ client, onEdit }: ClientCardProps) {
  const typeLabel = CLIENT_TYPE_LABELS[client.type ?? ""] ?? client.type ?? "—";
  const company = clientDisplayCompany(client);
  const location = [client.city, client.country].filter(Boolean).join(", ");
  const projectsCount = client.projectsCount ?? client._count?.projects ?? 0;
  const activeProjects = client.activeProjectsCount ?? 0;
  const hasUnpaid = (client.unpaidInvoicesCount ?? 0) > 0;

  return (
    <article className={clientsListCard}>
      <div className={clientsListCardHeader}>
        <div className="min-w-0 flex-1">
          <Link href={`/clients/${client.id}`} className="block min-w-0">
            <h3 className="truncate text-[13px] font-semibold text-[#e8edf4]/92 transition group-hover/card:text-[#f0f4fa]">
              {client.name}
            </h3>
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant={statusVariant(client.status)}>
              {CLIENT_STATUS_LABELS[client.status ?? "ACTIVE"]}
            </Badge>
            <span className={clientsListCardMeta}>{typeLabel}</span>
            {location && (
              <>
                <span className={clientsListCardMeta} aria-hidden>
                  ·
                </span>
                <span className={cn(clientsListCardMeta, "truncate")}>{location}</span>
              </>
            )}
          </div>
          {company && (
            <p className="mt-1 truncate text-[11px] text-[#9aa3b0]/50">{company}</p>
          )}
        </div>
        <ClientCardMenu client={client} onEdit={() => onEdit?.(client)} />
      </div>

      <div className={clientsListCardBody}>
        <ClientQuickContactActions client={client} />

        <div className={clientsListCardStats}>
          <span>
            {projectsCount} projet{projectsCount !== 1 ? "s" : ""}
            {activeProjects > 0 &&
              ` · ${activeProjects} actif${activeProjects !== 1 ? "s" : ""}`}
          </span>
          {hasUnpaid && (
            <span className={clientsListCardFinance}>
              {client.unpaidInvoicesCount} impayée
              {(client.remainingAmount ?? 0) > 0 &&
                ` · ${formatCurrency(client.remainingAmount ?? 0)}`}
            </span>
          )}
        </div>
      </div>

      <p className={clientsListCardFooter}>
        Dernière activité {formatRelativeTime(client.lastActivityAt ?? client.updatedAt)}
      </p>
    </article>
  );
}
