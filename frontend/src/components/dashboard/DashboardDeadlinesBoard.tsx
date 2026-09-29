"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import DashboardTaskCheckbox from "@/components/dashboard/DashboardTaskCheckbox";
import { useUpdateDeadline } from "@/hooks/useDashboard";
import { dateKey, isSameLocalDay } from "@/lib/dates";
import type { Deadline } from "@/types";
import { cn } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";
import {
  dashboardLink,
  dashboardPanel,
  dashboardPanelHeader,
  dashboardPanelTitle,
  dashboardViewBtn,
  dashboardViewToggle,
} from "./dashboard-ui";

type DeadlineView = "week" | "month";

interface DashboardDeadlinesBoardProps {
  deadlines: Deadline[];
  className?: string;
}

function openDeadlines(deadlines: Deadline[]) {
  const seen = new Set<string>();
  return deadlines.filter((d) => {
    if (d.done || seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

export default function DashboardDeadlinesBoard({
  deadlines,
  className,
}: DashboardDeadlinesBoardProps) {
  const [view, setView] = useState<DeadlineView>("week");
  const updateDeadline = useUpdateDeadline();
  const today = startOfDay(new Date());
  const items = useMemo(() => openDeadlines(deadlines), [deadlines]);

  const days = useMemo(() => {
    if (view === "week") {
      return Array.from({ length: 7 }, (_, i) => addDays(today, i));
    }
    const monthStart = startOfMonth(today);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(today), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [today, view]);

  const forDay = (day: Date) =>
    items.filter((d) => isSameLocalDay(d.date, day));

  return (
    <section className={cn(dashboardPanel, "overflow-hidden", className)}>
      <div className={dashboardPanelHeader}>
        <h2 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Deadlines
        </h2>
        <div className="flex items-center gap-2">
          <div className={dashboardViewToggle} role="group" aria-label="Période">
            <button
              type="button"
              onClick={() => setView("week")}
              className={cn(dashboardViewBtn(view === "week"), "px-2.5 py-1 text-[11px] font-medium")}
            >
              Semaine
            </button>
            <button
              type="button"
              onClick={() => setView("month")}
              className={cn(dashboardViewBtn(view === "month"), "px-2.5 py-1 text-[11px] font-medium")}
            >
              Mois
            </button>
          </div>
          <Link
            href="/deadlines"
            className={cn(dashboardLink, "inline-flex items-center gap-0.5 text-[10px]")}
          >
            Toutes
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <CalendarClock className="h-7 w-7 text-glass-muted/40" strokeWidth={1.25} />
          <p className="text-[12px] text-glass-muted">
            Aucune deadline ouverte. Une deadline non cochée reste à l&apos;agenda et passe au jour suivant.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto p-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            className={cn(
              "grid gap-2",
              view === "week"
                ? "min-w-[44rem] grid-cols-7 lg:min-w-0"
                : "min-w-[44rem] grid-cols-7 lg:min-w-0"
            )}
          >
            {view === "month" &&
              ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"].map((label) => (
                <p
                  key={label}
                  className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-glass-muted"
                >
                  {label}
                </p>
              ))}
            {days.map((day) => {
              const dayItems = forDay(day);
              const isToday = isSameLocalDay(day, today);
              const inMonth = view === "week" || isSameMonth(day, today);
              return (
                <div
                  key={dateKey(day)}
                  className={cn(
                    "min-h-[4.5rem] rounded-lg border border-app px-1.5 py-1.5",
                    isToday && "border-[color:var(--dash-week-today-border)] bg-[color:var(--dash-week-today-bg)]",
                    !inMonth && "opacity-40"
                  )}
                >
                  <p
                    className={cn(
                      "mb-1 text-center text-[10px] font-semibold tabular-nums",
                      isToday ? "text-[color:var(--studio-light)]" : "text-glass-muted"
                    )}
                  >
                    {view === "week"
                      ? `${isToday ? "Aujourd'hui" : format(day, "EEE", { locale: fr })} ${format(day, "d", { locale: fr })}`
                      : format(day, "d")}
                  </p>
                  <ul className="space-y-1">
                    {dayItems.map((deadline) => (
                      <li key={deadline.id} className="flex items-start gap-1">
                        <DashboardTaskCheckbox
                          checked={false}
                          disabled={updateDeadline.isPending}
                          onToggle={() =>
                            updateDeadline.mutate({ id: deadline.id, done: true })
                          }
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-medium leading-snug text-glass">
                            {deadline.title}
                          </p>
                          {deadline.project?.name && (
                            <p className="truncate text-[9px] text-glass-muted">
                              {deadline.project.name}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
