"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import Badge from "@/components/ui/Badge";
import {
  GlassListHeader,
  GlassListRow,
  GlassListTable,
  GlassPageShell,
} from "@/components/ui/GlassPageShell";
import { useDeadlines } from "@/hooks/useDeadlines";
import { PRIORITY_COLORS } from "@/types";
import { listLink } from "@/lib/theme-classes";
import { formatDate } from "@/lib/utils";

export default function DeadlinesPage() {
  const { data: deadlines = [], isLoading, isError, refetch } = useDeadlines();

  return (
    <GlassPageShell
      title="Deadlines"
      description="Échéances importantes de vos projets"
      icon={CalendarClock}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && deadlines.length === 0}
      emptyTitle="Aucune deadline"
      emptyDescription="Créez des deadlines depuis un projet ou le tableau de bord."
    >
      <GlassListTable>
        <GlassListHeader
          columns={["Titre", "Date", "Projet", "Priorité", "Statut"]}
          className="grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.6fr)]"
        />
        {deadlines.map((d) => (
          <GlassListRow
            key={d.id}
            className="grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.6fr)]"
          >
            <span className="truncate font-medium text-app-primary">{d.title}</span>
            <span>{formatDate(d.date)}</span>
            <span className="truncate">
              {d.project ? (
                <Link href={`/projects/${d.project.id}`} className={listLink}>
                  {d.project.name}
                </Link>
              ) : (
                "—"
              )}
            </span>
            <span>
              <Badge className={PRIORITY_COLORS[d.priority]}>{d.priority}</Badge>
            </span>
            <span className="text-glass-muted">{d.done ? "Terminé" : "En cours"}</span>
          </GlassListRow>
        ))}
      </GlassListTable>
    </GlassPageShell>
  );
}
