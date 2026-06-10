"use client";

import Link from "next/link";
import { useMemo } from "react";
import { addDays, format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowUpRight } from "lucide-react";
import { calendarWeekColumn } from "@/components/calendar/calendar-ui";
import type { Deadline, Meeting, Task } from "@/types";
import { dateKey, isSameLocalDay, isUrgentDeadline } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";
import {
  dashboardEventChipDeadline,
  dashboardEventChipMeeting,
  dashboardEventChipTask,
  dashboardLink,
  dashboardPanel,
  dashboardPanelHeader,
  dashboardPanelTitle,
} from "./dashboard-ui";

type WeekItem = {
  id: string;
  kind: "task" | "meeting" | "deadline";
  title: string;
  time?: string | null;
  projectName?: string;
  urgent?: boolean;
  href: string;
};

const KIND_CHIP: Record<WeekItem["kind"], string> = {
  task: dashboardEventChipTask,
  meeting: dashboardEventChipMeeting,
  deadline: dashboardEventChipDeadline,
};

const KIND_LABEL: Record<WeekItem["kind"], string> = {
  task: "Tâche",
  meeting: "Réunion",
  deadline: "Deadline",
};

interface DashboardWeekCalendarProps {
  tasks?: Task[];
  deadlines?: Deadline[];
  meetings?: Meeting[];
  className?: string;
}

function dedupeTasks(tasks: Task[]): Task[] {
  const seen = new Set<string>();
  return tasks.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

function WeekEventChip({ item }: { item: WeekItem }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "block w-full rounded-md px-1.5 py-1.5 text-left text-[10px] leading-snug ring-1 ring-inset transition",
        "hover:brightness-95 dark:hover:brightness-110",
        KIND_CHIP[item.kind],
        item.urgent && "!ring-red-500/60"
      )}
    >
      <span className="block font-semibold leading-tight">{item.title}</span>
      <span className="mt-0.5 block text-[9px] opacity-85">
        {KIND_LABEL[item.kind]}
        {item.time && ` · ${item.time}`}
      </span>
    </Link>
  );
}

export default function DashboardWeekCalendar({
  tasks = [],
  deadlines = [],
  meetings = [],
  className,
}: DashboardWeekCalendarProps) {
  const today = startOfDay(new Date());
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(today, i)),
    [today]
  );

  const allTasks = useMemo(() => dedupeTasks(tasks), [tasks]);

  const itemsForDay = (day: Date): WeekItem[] => {
    const items: WeekItem[] = [];

    for (const m of meetings) {
      if (isSameLocalDay(m.date, day)) {
        items.push({
          id: `m-${m.id}`,
          kind: "meeting",
          title: m.title,
          time: m.startTime,
          projectName: m.project?.name,
          href: "/calendar",
        });
      }
    }

    for (const d of deadlines) {
      if (isSameLocalDay(d.date, day) && !d.done) {
        items.push({
          id: `d-${d.id}`,
          kind: "deadline",
          title: d.title,
          projectName: d.project?.name,
          urgent: isUrgentDeadline(d.date, d.done),
          href: "/calendar",
        });
      }
    }

    for (const t of allTasks) {
      const td = t.scheduledAt ?? t.dueDate;
      if (td && isSameLocalDay(td, day) && t.status !== "DONE") {
        items.push({
          id: `t-${t.id}`,
          kind: "task",
          title: t.title,
          projectName: t.project?.name,
          href: t.projectId ? `/projects/${t.projectId}?tab=tasks` : "/tasks",
        });
      }
    }

    return items.sort((a, b) =>
      a.time && b.time ? a.time.localeCompare(b.time) : 0
    );
  };

  return (
    <section className={cn(dashboardPanel, className)}>
      <div className={dashboardPanelHeader}>
        <h2 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Calendrier de la semaine
        </h2>
        <Link
          href="/calendar"
          className={cn(dashboardLink, "inline-flex items-center gap-0.5 text-[10px]")}
        >
          Ouvrir le calendrier
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto p-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="grid min-w-[44rem] grid-cols-7 gap-2 lg:min-w-0">
          {days.map((day) => {
            const items = itemsForDay(day);
            const isToday = isSameLocalDay(day, today);

            return (
              <div
                key={dateKey(day)}
                className={cn(
                  calendarWeekColumn,
                  isToday &&
                    "border-[color:var(--dash-week-today-border)] bg-[color:var(--dash-week-today-bg)] ring-1 ring-[color:var(--dash-week-today-border)]"
                )}
              >
                <div className="mb-2 border-b border-app pb-2 text-center">
                  <p
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide",
                      isToday ? "text-[color:var(--studio-light)]" : "text-glass-muted"
                    )}
                  >
                    {isToday ? "Aujourd'hui" : format(day, "EEE", { locale: fr })}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-app-primary">
                    {format(day, "d MMM", { locale: fr })}
                  </p>
                </div>

                <div className="min-h-[5.5rem] space-y-1">
                  {items.length === 0 ? (
                    <p className="py-4 text-center text-[10px] text-glass-muted">—</p>
                  ) : (
                    items.map((item) => <WeekEventChip key={item.id} item={item} />)
                  )}
                </div>

                {items.length > 0 && (
                  <p className="mt-2 text-center text-[9px] tabular-nums text-glass-muted">
                    {items.length} élément{items.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
