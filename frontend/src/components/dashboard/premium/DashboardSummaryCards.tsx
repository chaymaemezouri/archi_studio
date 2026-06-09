"use client";

import {
  CalendarClock,
  CheckSquare,
  FileSpreadsheet,
  FolderKanban,
} from "lucide-react";
import StatCard from "./StatCard";
import type { DashboardStats } from "@/types";
import { countOpenTodayTasks } from "./dashboard-utils";
import type { Task } from "@/types";

interface DashboardSummaryCardsProps {
  stats?: DashboardStats;
  todayTasks?: Task[];
  financeHint?: string | null;
}

export default function DashboardSummaryCards({
  stats,
  todayTasks = [],
  financeHint,
}: DashboardSummaryCardsProps) {
  const active = stats?.activeProjects ?? 0;
  const todayCount = countOpenTodayTasks(todayTasks);
  const deadlines = stats?.upcomingDeadlines ?? 0;
  const devis = stats?.pendingDevis ?? 0;
  const payments = stats?.paymentsCount ?? 0;

  const financeValue = devis + payments;
  const financeDesc =
    devis > 0 && payments > 0
      ? `${devis} devis · ${payments} paiements`
      : devis > 0
        ? `${devis} devis en attente`
        : payments > 0
          ? `${payments} paiements`
          : "Rien en attente";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Projets actifs"
          value={active}
          description={active > 0 ? "En cours" : "—"}
          href="/projects"
          icon={FolderKanban}
          iconClassName="text-amber-600/80"
          compact={active === 0}
        />
        <StatCard
          label="Tâches aujourd'hui"
          value={todayCount}
          description={todayCount > 0 ? "À traiter" : "Journée libre"}
          href="/dashboard"
          icon={CheckSquare}
          iconClassName="text-emerald-600/80"
          compact={todayCount === 0}
        />
        <StatCard
          label="Deadlines proches"
          value={deadlines}
          description={deadlines > 0 ? "7 prochains jours" : "—"}
          href="/deadlines"
          icon={CalendarClock}
          iconClassName="text-orange-600/80"
          compact={deadlines === 0}
        />
        <StatCard
          label="Devis / Paiements"
          value={financeValue}
          description={financeDesc}
          href={devis > 0 ? "/finances/quotes-invoices" : "/payments"}
          icon={FileSpreadsheet}
          iconClassName="text-sky-600/80"
          compact={financeValue === 0}
        />
      </div>
      {financeHint && (
        <p className="text-center text-xs text-slate-400 sm:text-left">{financeHint}</p>
      )}
    </div>
  );
}
