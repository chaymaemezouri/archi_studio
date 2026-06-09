"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import api from "@/lib/api";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { PRIORITY_COLORS } from "@/types";
import type { Deadline } from "@/types";
import { formatDate } from "@/lib/utils";

export default function DeadlinesPage() {
  const { data: deadlines = [], isLoading } = useQuery({
    queryKey: ["deadlines"],
    queryFn: async () => {
      const { data } = await api.get<Deadline[]>("/deadlines");
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Deadlines</h1>
        <p className="mt-1 text-text-secondary">Suivez vos deadlines importantes</p>
      </div>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : deadlines.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Aucune deadline"
          description="Créez des deadlines pour ne rien oublier."
        />
      ) : (
        <Table
          data={deadlines}
          keyExtractor={(d) => d.id}
          columns={[
            { key: "title", header: "Titre" },
            { key: "date", header: "Date", render: (d) => formatDate(d.date) },
            { key: "project", header: "Projet", render: (d) => d.project?.name || "—" },
            {
              key: "priority",
              header: "Priorité",
              render: (d) => (
                <Badge className={PRIORITY_COLORS[d.priority]}>{d.priority}</Badge>
              ),
            },
            { key: "done", header: "Statut", render: (d) => (d.done ? "Terminé" : "En cours") },
          ]}
        />
      )}
    </div>
  );
}

