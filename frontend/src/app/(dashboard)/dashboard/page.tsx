"use client";

import { useMemo, useState } from "react";
import { addDays } from "date-fns";
import DashboardActiveProjects from "@/components/dashboard/DashboardActiveProjects";
import DashboardDayTasks from "@/components/dashboard/DashboardDayTasks";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DashboardPrioritySection from "@/components/dashboard/DashboardPrioritySection";
import DashboardStatsStrip from "@/components/dashboard/DashboardStatsStrip";
import DashboardTodayMeetings from "@/components/dashboard/DashboardTodayMeetings";
import DashboardTomorrowTasks from "@/components/dashboard/DashboardTomorrowTasks";
import DashboardWeekCalendar from "@/components/dashboard/DashboardWeekCalendar";
import QuickAddModal, { type QuickAddMode } from "@/components/dashboard/QuickAddModal";
import { dashboardPageStack, dashboardPanel } from "@/components/dashboard/dashboard-ui";
import type { QuickAddAction } from "@/components/dashboard/DashboardAddMenu";
import { useDashboardOverview } from "@/hooks/useDashboard";
import { buildDashboardPriorityProjects } from "@/lib/dashboard-urgency";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";

function dedupeTasks(lists: Task[][]): Task[] {
  const seen = new Set<string>();
  const out: Task[] = [];
  for (const list of lists) {
    for (const t of list) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(t);
    }
  }
  return out;
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardOverview();
  const today = new Date();
  const tomorrow = addDays(today, 1);

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<QuickAddMode>("task");
  const [quickAddDate, setQuickAddDate] = useState(today);

  const openQuickAdd = (action: QuickAddAction, date: Date = today) => {
    setQuickAddMode(action);
    setQuickAddDate(date);
    setQuickAddOpen(true);
  };

  const priorityAlerts = useMemo(() => {
    const alerts = data?.smartAlerts ?? [];
    const order = { overdue: 0, today: 1, tomorrow: 2, soon: 3 };
    return [...alerts].sort(
      (a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
    );
  }, [data?.smartAlerts]);

  const activeProjects = useMemo(() => {
    const list = data?.projectsInProgress ?? [];
    const priority = buildDashboardPriorityProjects(list, 8);
    return priority.length > 0 ? priority : list.slice(0, 8);
  }, [data?.projectsInProgress]);

  const weekTasks = useMemo(
    () =>
      dedupeTasks([
        data?.todayTasks ?? [],
        data?.tomorrowTasks ?? [],
        data?.calendarTasks ?? [],
      ]),
    [data?.todayTasks, data?.tomorrowTasks, data?.calendarTasks]
  );

  const allDeadlines = useMemo(() => {
    const seen = new Set<string>();
    return [...(data?.upcomingDeadlines ?? []), ...(data?.calendarDeadlines ?? [])].filter(
      (d) => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      }
    );
  }, [data?.upcomingDeadlines, data?.calendarDeadlines]);

  const openTodayTasksCount = useMemo(
    () => (data?.todayTasks ?? []).filter((t) => t.status !== "DONE").length,
    [data?.todayTasks]
  );

  return (
    <div className={dashboardPageStack}>
      <DashboardPageHeader
        today={today}
        isLoading={isLoading}
        onQuickAdd={(action) => openQuickAdd(action, today)}
      />

      {isError ? (
        <section className={cn(dashboardPanel, "p-8 text-center")}>
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
        <div className="space-y-2.5">
          <div className={cn(dashboardPanel, "h-24 animate-pulse")} />
          <div className="grid gap-2.5 lg:grid-cols-12">
            <div className={cn(dashboardPanel, "h-[32rem] animate-pulse lg:col-span-4")} />
            <div className={cn(dashboardPanel, "h-[32rem] animate-pulse lg:col-span-8")} />
          </div>
        </div>
      ) : data ? (
        <>
          <DashboardStatsStrip
            stats={data.stats}
            todayTasksCount={openTodayTasksCount}
          />

          <DashboardPrioritySection
            alerts={priorityAlerts}
            notifications={data.importantNotifications ?? []}
            stats={data.stats}
          />

          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-12 lg:items-start">
            <div className="flex flex-col gap-2.5 lg:col-span-4">
              <DashboardDayTasks
                tasks={data.todayTasks ?? []}
                projects={data.projectsInProgress}
                defaultDate={today}
              />
              <DashboardTomorrowTasks
                tasks={data.tomorrowTasks ?? []}
                onAddTomorrow={() => openQuickAdd("task", tomorrow)}
              />
              <DashboardTodayMeetings
                meetings={data.meetings ?? []}
                today={today}
              />
            </div>

            <DashboardWeekCalendar
              tasks={weekTasks}
              deadlines={allDeadlines}
              meetings={data.meetings ?? []}
              className="lg:col-span-8"
            />
          </div>

          <DashboardActiveProjects projects={activeProjects} />
        </>
      ) : null}

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultDate={quickAddDate}
        projects={data?.projectsInProgress}
        initialMode={quickAddMode}
      />
    </div>
  );
}
