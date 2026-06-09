"use client";

import Link from "next/link";
import { Building2, Hash, User } from "lucide-react";
import ClientContactField from "./ClientContactField";
import { clientDisplayCompany } from "./ClientQuickContactActions";
import ClientTabSection from "./ClientTabSection";
import {
  detailClientInfoLabel,
  detailClientInfoValue,
  detailClientProfileBlock,
  detailClientProfileBlockTitle,
  detailClientProfileGrid,
  detailClientProfileAdmin,
  detailClientProfileMeta,
} from "./client-detail-ui";
import {
  CLIENT_SOURCE_LABELS,
  CLIENT_STATUS_LABELS,
  CLIENT_TYPE_LABELS,
  type Client,
} from "@/types";
import { formatDate } from "@/lib/utils";

interface ClientProfileOverviewProps {
  client: Client;
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-0.5">
      <span className={detailClientInfoLabel}>{label}</span>
      <span className={detailClientInfoValue}>{value}</span>
    </div>
  );
}

function hasAdminFields(client: Client): boolean {
  return Boolean(client.ice || client.taxId || client.rc || client.cnss);
}

export default function ClientProfileOverview({ client }: ClientProfileOverviewProps) {
  const isCompany = client.type === "COMPANY";
  const companyLabel = clientDisplayCompany(client);
  const mapsQuery = [client.address, client.city, client.country].filter(Boolean).join(", ");
  const hasAddress = Boolean(client.address || client.city || client.country);
  const hasContact = Boolean(
    client.phone || client.secondaryPhone || client.email
  );

  return (
    <ClientTabSection title="Fiche client">
      <div className={detailClientProfileGrid}>
        <div className={detailClientProfileBlock}>
          <h3 className={detailClientProfileBlockTitle}>
            <User className="h-3.5 w-3.5" aria-hidden />
            Identité
          </h3>
          <div className="space-y-0.5">
            <MetaRow
              label="Type"
              value={CLIENT_TYPE_LABELS[client.type ?? ""] ?? client.type ?? undefined}
            />
            <MetaRow
              label="Statut"
              value={CLIENT_STATUS_LABELS[client.status ?? "ACTIVE"]}
            />
            {client.source && (
              <MetaRow
                label="Source"
                value={CLIENT_SOURCE_LABELS[client.source] ?? client.source}
              />
            )}
            {companyLabel && (
              <MetaRow
                label={isCompany ? "Entreprise" : "Société liée"}
                value={companyLabel}
              />
            )}
            <p className={detailClientProfileMeta}>
              Client depuis {formatDate(client.createdAt)}
            </p>
          </div>
        </div>

        {hasContact && (
          <div className={detailClientProfileBlock}>
            <h3 className={detailClientProfileBlockTitle}>Coordonnées</h3>
            <div className="space-y-2">
              <ClientContactField label="Téléphone" value={client.phone} kind="phone" />
              <ClientContactField
                label="Tél. secondaire"
                value={client.secondaryPhone}
                kind="phone"
              />
              <ClientContactField label="Email" value={client.email} kind="email" />
            </div>
          </div>
        )}

        {hasAddress && (
          <div className={detailClientProfileBlock}>
            <h3 className={detailClientProfileBlockTitle}>
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              Adresse
            </h3>
            <div className="space-y-2">
              <ClientContactField
                label="Adresse"
                value={client.address}
                kind="address"
                mapsQuery={mapsQuery || null}
              />
              <MetaRow label="Ville" value={client.city} />
              <MetaRow label="Pays" value={client.country} />
            </div>
          </div>
        )}
      </div>

      {hasAdminFields(client) && (
        <div className={detailClientProfileAdmin}>
          <h3 className={detailClientProfileBlockTitle}>
            <Hash className="h-3.5 w-3.5" aria-hidden />
            Informations administratives
          </h3>
          <div className="mt-2 grid gap-x-6 gap-y-0.5 sm:grid-cols-2">
            <MetaRow label="ICE" value={client.ice} />
            <MetaRow label="IF / Identifiant fiscal" value={client.taxId} />
            <MetaRow label="RC" value={client.rc} />
            <MetaRow label="CNSS" value={client.cnss} />
          </div>
        </div>
      )}

      {client.notes?.trim() && !(client.clientNotes?.length) && (
        <div className={detailClientProfileAdmin}>
          <div className="flex items-center justify-between gap-2">
            <h3 className={detailClientProfileBlockTitle}>Note interne</h3>
            <Link
              href={`/clients/${client.id}?tab=notes`}
              className="text-[11px] text-glass-muted hover:text-[#b8cfe8]/95"
              scroll={false}
            >
              Gérer dans Notes →
            </Link>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-glass-secondary">
            {client.notes}
          </p>
        </div>
      )}
    </ClientTabSection>
  );
}
