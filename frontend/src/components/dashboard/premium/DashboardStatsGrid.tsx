"use client";

import {
  Bell,
  CalendarClock,
  CreditCard,
  FileSpreadsheet,
  FolderKanban,
  Receipt,
} from "lucide-react";
import StatCard from "./StatCard";
import type { DashboardStats } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsGridProps {
  stats?: DashboardStats;
  unreadNotifications?: number;
}

export default function DashboardStatsGrid({
  stats,
  unreadNotifications = 0,
}: DashboardStatsGridProps) {
  const active = stats?.activeProjects ?? 0;
  const deadlines = stats?.upcomingDeadlines ?? 0;
  const devis = stats?.pendingDevis ?? 0;
  const invoices = stats?.pendingInvoices ?? 0;
  const payments = stats?.paymentsCount ?? 0;
  const unpaid = stats?.unpaidInvoicesAmount ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Projets actifs"
        value={active}
        description={active > 0 ? "En cours" : "Aucun projet"}
        href="/projects"
        icon={FolderKanban}
        iconClassName="text-amber-600/90"
      />
      <StatCard
        label="Deadlines à venir"
        value={deadlines}
        description={deadlines > 0 ? "Cette semaine" : "Aucune urgence"}
        href="/deadlines"
        icon={CalendarClock}
        iconClassName="text-orange-600/90"
      />
      <StatCard
        label="Notifications"
        value={unreadNotifications}
        description={unreadNotifications > 0 ? "Non lues" : "Tout est lu"}
        href="/notifications"
        icon={Bell}
        iconClassName="text-violet-600/90"
      />
      <StatCard
        label="Devis en cours"
        value={devis}
        description={devis > 0 ? "En attente" : "Aucun devis"}
        href="/finances/quotes-invoices"
        icon={FileSpreadsheet}
        iconClassName="text-emerald-600/90"
      />
      <StatCard
        label="Factures"
        value={invoices}
        description={invoices > 0 ? formatCurrency(unpaid) + " impayé" : "À jour"}
        href="/finances/quotes-invoices?tab=invoices"
        icon={Receipt}
        iconClassName="text-rose-600/90"
      />
      <StatCard
        label="Paiements"
        value={payments}
        description={payments > 0 ? "Enregistrés" : "Aucun paiement"}
        href="/payments"
        icon={CreditCard}
        iconClassName="text-sky-600/90"
      />
    </div>
  );
}
