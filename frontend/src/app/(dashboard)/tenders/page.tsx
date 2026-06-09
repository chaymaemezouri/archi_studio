"use client";

import { useQuery } from "@tanstack/react-query";
import { Gavel } from "lucide-react";
import Badge from "@/components/ui/Badge";
import {
  GlassListHeader,
  GlassListRow,
  GlassListTable,
  GlassPageShell,
} from "@/components/ui/GlassPageShell";
import api from "@/lib/api";
import { TENDER_STATUS_LABELS } from "@/types";
import type { Tender } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TendersPage() {
  const { data: tenders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["tenders"],
    queryFn: async () => {
      const { data } = await api.get<Tender[]>("/tenders");
      return data;
    },
  });

  return (
    <GlassPageShell
      title="Appels d'offres"
      description="Concours et marchés publics"
      icon={Gavel}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && tenders.length === 0}
      emptyTitle="Aucun appel d'offres"
      emptyDescription="Suivez vos tenders et concours ici."
    >
      <GlassListTable>
        <GlassListHeader
          columns={["Nom", "Client", "Budget", "Deadline", "Statut"]}
          className="grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.7fr)]"
        />
        {tenders.map((t) => (
          <GlassListRow
            key={t.id}
            className="grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.7fr)]"
          >
            <span className="truncate font-medium text-app-primary">{t.name}</span>
            <span className="truncate">{t.client || "—"}</span>
            <span className="tabular-nums">{t.budget ? formatCurrency(t.budget) : "—"}</span>
            <span>{t.deadline ? formatDate(t.deadline) : "—"}</span>
            <span>
              <Badge variant="accent">{TENDER_STATUS_LABELS[t.status]}</Badge>
            </span>
          </GlassListRow>
        ))}
      </GlassListTable>
    </GlassPageShell>
  );
}
