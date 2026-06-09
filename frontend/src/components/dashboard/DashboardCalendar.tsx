"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import DashboardCard from "./DashboardCard";
import QuickAddModal from "./QuickAddModal";
import Tooltip from "@/components/ui/Tooltip";
import { dashboardCardTitle, dashboardIconBtn } from "./dashboard-ui";
import type { Deadline, Meeting, Project, Task } from "@/types";
import { dateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface DashboardCalendarProps {
  meetings?: Meeting[];
  deadlines?: Deadline[];
  tasks?: Task[];
  projects?: Project[];
  compact?: boolean;
}

export default function DashboardCalendar({
  meetings = [],
  deadlines = [],
  tasks = [],
  projects = [],
  compact = false,
}: DashboardCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const countsByDay = useMemo(() => {
    const map = new Map<string, number>();
    const bump = (key: string) => map.set(key, (map.get(key) ?? 0) + 1);
    for (const m of meetings) bump(dateKey(m.date));
    for (const d of deadlines) if (!d.done) bump(dateKey(d.date));
    for (const t of tasks) {
      if (t.status === "DONE") continue;
      if (t.dueDate) bump(dateKey(t.dueDate));
      if (t.scheduledAt) bump(dateKey(t.scheduledAt));
    }
    return map;
  }, [meetings, deadlines, tasks]);

  const today = new Date();

  return (
    <>
      <DashboardCard className="!p-3.5" interactive>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 className={dashboardCardTitle}>Calendrier</h2>
            <Link href="/calendar" className="text-[10px] font-medium text-stone-400 hover:text-[#B85C15] hover:underline">
              Voir calendrier complet
            </Link>
          </div>
          <Tooltip label="Ajouter deadline ou réunion">
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-stone-50/80 px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:border-stone-300 hover:bg-white hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
            >
              <Plus className="h-3 w-3" />
              Ajouter
            </button>
          </Tooltip>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <Tooltip label="Mois précédent">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className={cn(dashboardIconBtn, "border border-transparent hover:border-stone-200/80")}
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </Tooltip>
          <span className="text-xs font-semibold capitalize tracking-wide text-stone-700">
            {format(currentMonth, compact ? "MMMM yyyy" : "MMMM yyyy", { locale: fr })}
          </span>
          <Tooltip label="Mois suivant">
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className={cn(dashboardIconBtn, "border border-transparent hover:border-stone-200/80")}
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>

        <div className="mb-1.5 grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium uppercase tracking-wide text-stone-400">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <span key={`${d}-${i}`} className="py-1">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = dateKey(day);
            const inMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDay);
            const count = countsByDay.get(key) ?? 0;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "relative flex h-8 items-center justify-center text-[11px] transition-all duration-200",
                  !inMonth && "text-stone-300",
                  inMonth && !isSelected && "text-stone-600 hover:text-stone-900"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-all",
                    isSelected && "bg-stone-900 font-semibold text-white shadow-sm",
                    !isSelected && isToday && "ring-1 ring-stone-400/80 ring-offset-1",
                    !isSelected && inMonth && "hover:bg-stone-100"
                  )}
                >
                  {format(day, "d")}
                </span>
                {count > 0 && inMonth && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-stone-400" />
                )}
                {count > 0 && inMonth && isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/80" />
                )}
              </button>
            );
          })}
        </div>
      </DashboardCard>

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultDate={selectedDay}
        projects={projects}
      />
    </>
  );
}
