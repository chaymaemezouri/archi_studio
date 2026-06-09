"use client";

import Link from "next/link";
import {
  CalendarClock,
  CreditCard,
  FileSpreadsheet,
  FolderKanban,
  LucideIcon,
  Receipt,
} from "lucide-react";
import type { DashboardStats } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { dashboardCard, dashboardCardTitle } from "./dashboard-ui";

interface StatItem {
  label: string;
  value: number;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

function buildStats(stats?: DashboardStats): StatItem[] {
  const active = stats?.activeProjects ?? 0;
  const deadlines = stats?.upcomingDeadlines ?? 0;
  const devis = stats?.pendingDevis ?? 0;
  const invoices = stats?.pendingInvoices ?? 0;
  const payments = stats?.paymentsCount ?? 0;
  const unpaid = stats?.unpaidInvoicesAmount ?? 0;

  return [
    {
      label: "Projets actifs",
      value: active,
      description: active > 0 ? "En cours" : "Aucun projet",
      href: "/projects",
      icon: FolderKanban,
      iconBg: "bg-amber-50/90 ring-1 ring-amber-100/80",
      iconColor: "text-amber-600/90",
    },
    {
      label: "Deadlines à venir",
      value: deadlines,
      description: deadlines > 0 ? "Cette semaine" : "Aucune urgence",
      href: "/deadlines",
      icon: CalendarClock,
      iconBg: "bg-orange-50/90 ring-1 ring-orange-100/80",
      iconColor: "text-orange-600/90",
    },
    {
      label: "Devis en cours",
      value: devis,
      description: devis > 0 ? "En attente" : "Aucun devis",
      href: "/finances/quotes-invoices",
      icon: FileSpreadsheet,
      iconBg: "bg-emerald-50/90 ring-1 ring-emerald-100/80",
      iconColor: "text-emerald-600/90",
    },
    {
      label: "Factures",
      value: invoices,
      description:
        invoices > 0
          ? unpaid > 0
            ? `${formatCurrency(unpaid)} impayé`
            : "À jour"
          : "Aucune facture",
      href: "/finances/quotes-invoices?tab=invoices",
      icon: Receipt,
      iconBg: "bg-rose-50/90 ring-1 ring-rose-100/80",
      iconColor: "text-rose-600/90",
    },
    {
      label: "Paiements",
      value: payments,
      description: payments > 0 ? "Enregistrés" : "Aucun paiement",
      href: "/payments",
      icon: CreditCard,
      iconBg: "bg-sky-50/90 ring-1 ring-sky-100/80",
      iconColor: "text-sky-600/90",
    },
  ];
}

export default function DashboardStatCards({ stats }: { stats?: DashboardStats }) {
  const items = buildStats(stats);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(dashboardCard, "flex h-[88px] flex-col justify-center p-3 sm:p-3.5")}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]",
                  item.iconBg
                )}
              >
                <Icon className={cn("h-[17px] w-[17px]", item.iconColor)} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-stone-400">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xl font-semibold leading-none tracking-tight text-stone-900 sm:text-[1.35rem]">
                  {item.value}
                </p>
                <p className="mt-1 truncate text-[10px] leading-tight text-stone-400">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
