"use client";

import Link from "next/link";
import {
  CalendarClock,
  FileSpreadsheet,
  FolderKanban,
  ListTodo,
  Receipt,
} from "lucide-react";
import type { DashboardStats } from "@/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";
import {
  dashboardMobileScrollItem,
  dashboardMobileScrollRow,
  dashboardPanel,
  dashboardStatLabel,
} from "./dashboard-ui";

interface DashboardStatsStripProps {
  stats: DashboardStats;
  todayTasksCount: number;
  className?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
}: {
  icon: typeof ListTodo;
  label: string;
  value: string;
  sub?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        dashboardMobileScrollItem,
        "group/stat block min-w-[9.5rem] flex-1 px-3 py-3 transition hover:bg-studio-light/[0.04] md:min-w-0"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-glass bg-studio-light/[0.06]">
          <Icon className="h-3.5 w-3.5 text-studio-light/80" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className={cn(dashboardStatLabel, "group-hover/stat:text-studio-light")}>
            {label}
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums leading-none text-app-primary">
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 truncate text-[10px] text-glass-muted">{sub}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function DashboardStatsStrip({
  stats,
  todayTasksCount,
  className,
}: DashboardStatsStripProps) {
  const nextDeadline =
    stats.nextDeadlineDate && stats.nextDeadlineTitle
      ? `${stats.nextDeadlineTitle} · ${formatDate(stats.nextDeadlineDate, "d MMM")}`
      : undefined;

  return (
    <section className={cn(dashboardPanel, className)}>
      <div className="flex items-center gap-2 border-b border-app px-3.5 py-2">
        <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
        <h2 className="text-[12px] font-semibold text-app-primary">Vue d&apos;ensemble</h2>
      </div>
      <div
        className={cn(
          dashboardMobileScrollRow,
          "md:grid md:grid-cols-3 lg:grid-cols-5 md:divide-x md:divide-app"
        )}
      >
        <StatCard
          icon={FolderKanban}
          label="Projets actifs"
          value={String(stats.activeProjects)}
          href="/projects"
        />
        <StatCard
          icon={ListTodo}
          label="Tâches aujourd'hui"
          value={String(todayTasksCount)}
          href="/tasks"
        />
        <StatCard
          icon={CalendarClock}
          label="Deadlines proches"
          value={String(stats.upcomingDeadlines)}
          sub={nextDeadline}
          href="/calendar"
        />
        <StatCard
          icon={FileSpreadsheet}
          label="Devis en attente"
          value={String(stats.pendingDevis)}
          href="/finances/quotes-invoices"
        />
        <StatCard
          icon={Receipt}
          label="Factures impayées"
          value={String(stats.pendingInvoices)}
          sub={
            stats.unpaidInvoicesAmount > 0
              ? formatCurrency(stats.unpaidInvoicesAmount)
              : undefined
          }
          href="/finances/quotes-invoices"
        />
      </div>
    </section>
  );
}
