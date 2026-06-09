"use client";

import type { Client } from "@/types";
import {
  detailClientTabActive,
  detailClientTabBtn,
  detailClientTabCount,
  detailClientTabInactive,
  detailClientTabIndicator,
  detailClientTabsNav,
} from "./client-detail-ui";
import { cn } from "@/lib/utils";

export const CLIENT_TABS = [
  { id: "overview", label: "Aperçu" },
  { id: "projects", label: "Projets" },
  { id: "quotes", label: "Devis" },
  { id: "invoices", label: "Factures" },
  { id: "payments", label: "Paiements" },
  { id: "documents", label: "Documents" },
  { id: "notes", label: "Notes" },
  { id: "activity", label: "Activité" },
] as const;

export type ClientTabId = (typeof CLIENT_TABS)[number]["id"];

interface ClientDetailTabsProps {
  active: ClientTabId;
  onChange: (tab: ClientTabId) => void;
  client: Client;
}

function tabCount(client: Client, tabId: ClientTabId): number | null {
  switch (tabId) {
    case "projects":
      return client.projects?.length ?? client.projectsCount ?? 0;
    case "quotes":
      return client.devis?.length ?? client.quotesCount ?? 0;
    case "invoices":
      return client.invoices?.length ?? client.invoicesCount ?? 0;
    case "payments":
      return client.payments?.length ?? 0;
    case "documents":
      return client.clientDocuments?.length ?? 0;
    case "notes":
      return client.clientNotes?.length ?? 0;
    case "activity":
      return client.activityLogs?.length ?? 0;
    default:
      return null;
  }
}

export default function ClientDetailTabs({ active, onChange, client }: ClientDetailTabsProps) {
  return (
    <nav className={detailClientTabsNav} aria-label="Sections client">
      <div className="flex min-w-max gap-0.5">
        {CLIENT_TABS.map((tab) => {
          const n = tabCount(client, tab.id);
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                detailClientTabBtn,
                isActive ? detailClientTabActive : detailClientTabInactive
              )}
            >
              {tab.label}
              {n != null && n > 0 && (
                <span className={detailClientTabCount}>{n}</span>
              )}
              {isActive && <span className={detailClientTabIndicator} aria-hidden />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
