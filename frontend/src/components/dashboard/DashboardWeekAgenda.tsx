"use client";

import Link from "next/link";
import { useMemo } from "react";
import { addDays, format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpRight,
  CalendarClock,
  ClipboardList,
  Users,
} from "lucide-react";
import type { Deadline, Meeting, Task } from "@/types";
import { dateKey, isSameLocalDay, isUrgentDeadline } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";
import {
  dashboardLink,
  dashboardPanel,
  dashboardPanelHeader,
  dashboardPanelTitle,
  dashboardSectionLabel,
} from "./dashboard-ui";

type AgendaItem = {
  id: string;
  kind: "meeting" | "deadline" | "task";
  title: string;
  time?: string | null;
  projectName?: string;
  urgent?: boolean;
  href: string;
};

interface DashboardWeekAgendaProps {
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

export default function DashboardWeekAgenda({
  tasks = [],
  deadlines = [],
  meetings = [],
  className,
}: DashboardWeekAgendaProps) {
  const today = startOfDay(new Date());
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(today, i)),
    [today]
  );

  const allTasks = useMemo(() => dedupeTasks(tasks), [tasks]);

  const itemsForDay = (day: Date): AgendaItem[] => {
    const items: AgendaItem[] = [];

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

  const weekTotal = days.reduce((n, day) => n + itemsForDay(day).length, 0);

  return (
    <section className={cn(dashboardPanel, className)}>
      <div className={dashboardPanelHeader}>
        <h2 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Semaine
          {weekTotal > 0 && (
            <span className="ml-1.5 text-[11px] font-normal tabular-nums text-glass-muted">
              ({weekTotal})
            </span>
          )}
        </h2>
        <Link
          href="/calendar"
          className={cn(dashboardLink, "inline-flex items-center gap-0.5 text-[10px]")}
        >
          Calendrier complet
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="max-h-[min(70vh,36rem)] space-y-2 overflow-y-auto p-2.5">
        {days.map((day) => {
          const items = itemsForDay(day);
          const isToday = isSameLocalDay(day, today);

          return (
            <div
              key={dateKey(day)}
              className={cn(
                "rounded-lg border px-3 py-2.5",
                isToday
                  ? "border-studio-border/50 bg-studio-light/[0.04]"
                  : "border-app bg-[color:var(--glass-bg)]/40"
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p
                  className={cn(
                    dashboardSectionLabel,
                    isToday && "text-studio-light"
                  )}
                >
                  {isToday ? "Aujourd'hui" : format(day, "EEEE", { locale: fr })}
                </p>
                <span className="text-[11px] tabular-nums text-glass-muted">
                  {format(day, "d MMM", { locale: fr })}
                </span>
              </div>

              {items.length === 0 ? (
                <p className="text-[11px] text-glass-muted">Rien de prévu</p>
              ) : (
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-start gap-2 rounded-md px-2 py-1.5 transition hover:bg-studio-muted/40",
                          item.urgent && "ring-1 ring-red-400/20"
                        )}
                      >
                        {item.kind === "meeting" && (
                          <Users
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400"
                            strokeWidth={1.75}
                          />
                        )}
                        {item.kind === "deadline" && (
                          <CalendarClock
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-400"
                            strokeWidth={1.75}
                          />
                        )}
                        {item.kind === "task" && (
                          <ClipboardList
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                            strokeWidth={1.75}
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] text-glass">
                            {item.time && (
                              <span className="mr-1.5 font-mono text-[10px] text-glass-muted">
                                {item.time}
                              </span>
                            )}
                            {item.title}
                          </span>
                          {item.projectName && (
                            <span className="mt-0.5 block truncate text-[10px] text-glass-muted">
                              {item.projectName}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
