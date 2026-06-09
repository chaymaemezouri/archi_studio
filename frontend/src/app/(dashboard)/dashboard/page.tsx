"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import DashboardActivityPanel from "@/components/dashboard/DashboardActivityPanel";
import DashboardChartsRow from "@/components/dashboard/DashboardChartsRow";
import DashboardFinancePanel from "@/components/dashboard/DashboardFinancePanel";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DashboardPriorityProjects from "@/components/dashboard/DashboardPriorityProjects";
import DashboardSmartAlertsStrip from "@/components/dashboard/DashboardSmartAlertsStrip";
import DashboardTodayPanel from "@/components/dashboard/DashboardTodayPanel";
import QuickAddModal, { type QuickAddMode } from "@/components/dashboard/QuickAddModal";
import { buildBriefFromOverview } from "@/components/dashboard/dashboard-executive";
import {
  dashboardMobileScrollItem,
  dashboardMobileScrollRow,
  dashboardPageStack,
  dashboardPanel,
  dashboardStatLabel,
} from "@/components/dashboard/dashboard-ui";
import type { QuickAddAction } from "@/components/dashboard/DashboardAddMenu";
import {
  useDashboardOverview,
  useUpdateDashboardTask,
  downloadWeeklySummaryPdf,
} from "@/hooks/useDashboard";
import { buildDashboardPriorityProjects } from "@/lib/dashboard-urgency";
import { cn, formatCurrency } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";

function StatItem({
  label,
  value,
  subValue,
  href,
  compact,
}: {
  label: string;
  value: string;
  subValue?: string;
  href?: string;
  compact?: boolean;
}) {
  const inner = (
    <div
      className={cn(
        "group/stat transition hover:bg-studio-light/[0.04]",
        compact ? "px-3 py-2.5" : "px-3 py-2"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn(accentBar, "h-1.5 opacity-75")} aria-hidden />
        <p className={cn(dashboardStatLabel, "group-hover/stat:text-studio-light")}>
          {label}
        </p>
      </div>
      <p
        className={cn(
          "mt-0.5 pl-2 font-semibold tabular-nums leading-none tracking-tight text-app-primary",
          compact ? "text-xl" : "text-lg"
        )}
      >
        {value}
      </p>
      {subValue && (
        <p className="mt-0.5 pl-2 text-[10px] text-glass-muted">{subValue}</p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function DashboardPage() {
  const updateTask = useUpdateDashboardTask();
  const { data, isLoading, isError, refetch } = useDashboardOverview();
  const today = new Date();

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<QuickAddMode>("deadline");
  const [pdfLoading, setPdfLoading] = useState(false);

  const todayBrief = useMemo(
    () => (data ? buildBriefFromOverview(data) : null),
    [data]
  );

  const openQuickAdd = (action: QuickAddAction) => {
    setQuickAddMode(action);
    setQuickAddOpen(true);
  };

  const priorityProjects = useMemo(
    () => buildDashboardPriorityProjects(data?.projectsInProgress, 6),
    [data?.projectsInProgress]
  );

  const priorityAlerts = useMemo(() => {
    const alerts = data?.smartAlerts ?? [];
    const order = { overdue: 0, today: 1, tomorrow: 2, soon: 3 };
    return [...alerts].sort(
      (a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
    );
  }, [data?.smartAlerts]);

  const tasksPreview = useMemo(() => {
    return (data?.todayTasks ?? [])
      .filter((t) => t.status !== "DONE")
      .sort((a, b) => {
        const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
      });
  }, [data?.todayTasks]);

  const deadlinesPreview = useMemo(() => {
    const seen = new Set<string>();
    const items = [
      ...(data?.upcomingDeadlines ?? []),
      ...(data?.calendarDeadlines ?? []),
    ].filter((d) => {
      if (d.done || !isSameDay(new Date(d.date), today)) return false;
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data?.upcomingDeadlines, data?.calendarDeadlines, today]);

  const todayAgenda = useMemo(() => {
    const items = [
      ...(data?.calendarDeadlines ?? [])
        .filter((d) => isSameDay(new Date(d.date), today))
        .map((d) => ({
          id: `d-${d.id}`,
          title: d.title,
          meta: format(d.date, "HH:mm"),
          href: "/calendar",
          sortTime: new Date(d.date).getTime(),
        })),
      ...(data?.meetings ?? [])
        .filter((m) => isSameDay(new Date(m.date), today))
        .map((m) => ({
          id: `m-${m.id}`,
          title: m.title,
          meta: m.startTime ?? "Réunion",
          href: "/calendar",
          sortTime: m.startTime
            ? new Date(`${format(m.date, "yyyy-MM-dd")}T${m.startTime}`).getTime()
            : new Date(m.date).getTime(),
        })),
    ];
    return items
      .sort((a, b) => a.sortTime - b.sortTime)
      .map(({ id, title, meta, href }) => ({ id, title, meta, href }));
  }, [data?.calendarDeadlines, data?.meetings, today]);

  const openTodayTasksCount = useMemo(() => {
    return (data?.todayTasks ?? []).filter((t) => t.status !== "DONE").length;
  }, [data?.todayTasks]);

  const headerStats = useMemo(() => {
    const unpaid = data?.stats?.unpaidInvoicesAmount ?? 0;
    return [
      {
        label: "Projets actifs",
        value: String(data?.stats?.activeProjects ?? 0),
        href: "/projects",
      },
      {
        label: "Tâches aujourd'hui",
        value: String(openTodayTasksCount),
        href: "/tasks",
      },
      {
        label: "Deadlines proches",
        value: String(data?.stats?.upcomingDeadlines ?? 0),
        href: "/calendar",
      },
      {
        label: "Devis en attente",
        value: String(data?.stats?.pendingDevis ?? 0),
        href: "/finances/quotes-invoices",
      },
      {
        label: "Factures en attente",
        value: String(data?.stats?.pendingInvoices ?? 0),
        href: "/finances/quotes-invoices",
        subValue: unpaid > 0 ? formatCurrency(unpaid) : undefined,
      },
    ];
  }, [data?.stats, openTodayTasksCount]);

  const handleWeeklyPdf = async () => {
    setPdfLoading(true);
    try {
      await downloadWeeklySummaryPdf();
    } finally {
      setPdfLoading(false);
    }
  };

  const statsSection = (
    <section className={cn(dashboardPanel, "order-5 lg:order-2")}>
      <div
        className={cn(
          dashboardMobileScrollRow,
          "md:grid-cols-3 lg:grid-cols-5 md:divide-x md:divide-app"
        )}
      >
        {headerStats.map((stat) => (
          <div key={stat.label} className={dashboardMobileScrollItem}>
            <StatItem {...stat} compact />
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className={dashboardPageStack}>
      <div className="order-1">
        <DashboardPageHeader
          today={today}
          brief={todayBrief}
          isLoading={isLoading}
          pdfLoading={pdfLoading}
          onWeeklyPdf={handleWeeklyPdf}
          onQuickAdd={openQuickAdd}
        />
      </div>

      {isError ? (
        <section className={cn(dashboardPanel, "order-2 p-8 text-center")}>
          <p className="text-sm text-glass-secondary">Impossible de charger le dashboard</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-[color:var(--glass-bg-hover)] px-4 py-2 text-[12px] text-glass transition hover:bg-studio-muted/50"
          >
            Réessayer
          </button>
        </section>
      ) : isLoading ? (
        <div className="order-2 space-y-2.5">
          <div className={cn(dashboardPanel, "h-36 animate-pulse lg:order-none")} />
          <div className={cn(dashboardPanel, "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5")}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse border-r border-app last:border-0" />
            ))}
          </div>
          <div className="grid gap-2.5 lg:grid-cols-5">
            <div className={cn(dashboardPanel, "h-52 animate-pulse lg:col-span-3")} />
            <div className={cn(dashboardPanel, "h-52 animate-pulse lg:col-span-2")} />
          </div>
        </div>
      ) : data ? (
        <>
          <div className="order-2 lg:order-3">
            <DashboardChartsRow data={data} />
          </div>

          <div className="order-3 lg:order-4">
            <DashboardSmartAlertsStrip alerts={priorityAlerts} />
          </div>

          <div className="order-4 lg:hidden">
            <DashboardTodayPanel
              agenda={todayAgenda}
              tasks={tasksPreview}
              deadlines={deadlinesPreview}
              onCompleteTask={(id) => updateTask.mutate({ id, status: "DONE" })}
              isCompletingTask={updateTask.isPending}
            />
          </div>

          {statsSection}

          <div className="order-6 grid grid-cols-1 gap-2.5 lg:order-5 lg:grid-cols-5 lg:items-start">
            <DashboardPriorityProjects projects={priorityProjects} className="lg:col-span-3" />
            <div className="hidden lg:col-span-2 lg:block">
              <DashboardTodayPanel
                agenda={todayAgenda}
                tasks={tasksPreview}
                deadlines={deadlinesPreview}
                onCompleteTask={(id) => updateTask.mutate({ id, status: "DONE" })}
                isCompletingTask={updateTask.isPending}
              />
            </div>
          </div>

          <div className="order-7 grid grid-cols-1 gap-2.5 lg:order-6 lg:grid-cols-2">
            <DashboardFinancePanel stats={data.stats} payments={data.recentPayments ?? []} />
            <DashboardActivityPanel activities={data.recentActivity ?? []} />
          </div>
        </>
      ) : null}

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultDate={today}
        projects={data?.projectsInProgress}
        initialMode={quickAddMode}
      />
    </div>
  );
}
