"use client";

import { useQuery } from "@tanstack/react-query";
import { Gavel } from "lucide-react";
import api from "@/lib/api";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { TENDER_STATUS_LABELS } from "@/types";
import type { Tender } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TendersPage() {
  const { data: tenders = [], isLoading } = useQuery({
    queryKey: ["tenders"],
    queryFn: async () => {
      const { data } = await api.get<Tender[]>("/tenders");
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tenders</h1>
        <p className="mt-1 text-text-secondary">Appels d&apos;offres et concours</p>
      </div>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : tenders.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="Aucun tender"
          description="Suivez vos appels d'offres ici."
        />
      ) : (
        <Table
          data={tenders}
          keyExtractor={(t) => t.id}
          columns={[
            { key: "name", header: "Nom" },
            { key: "client", header: "Client", render: (t) => t.client || "—" },
            {
              key: "budget",
              header: "Budget",
              render: (t) => (t.budget ? formatCurrency(t.budget) : "—"),
            },
            {
              key: "deadline",
              header: "Deadline",
              render: (t) => (t.deadline ? formatDate(t.deadline) : "—"),
            },
            {
              key: "status",
              header: "Statut",
              render: (t) => (
                <Badge variant="accent">{TENDER_STATUS_LABELS[t.status]}</Badge>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
