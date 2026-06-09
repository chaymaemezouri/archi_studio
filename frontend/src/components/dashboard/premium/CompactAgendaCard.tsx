"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarClock, ChevronRight, ClipboardList, Users } from "lucide-react";
import DashboardCard from "../DashboardCard";
import {
  buildAgendaEventsForDay,
  getAgendaDays,
} from "./dashboard-utils";
import type { Deadline, Meeting, Task } from "@/types";
import { dateKey, isSameLocalDay } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface CompactAgendaCardProps {
  meetings?: Meeting[];
  deadlines?: Deadline[];
  tasks?: Task[];
}

const KIND_ICON = {
  meeting: Users,
  deadline: CalendarClock,
  task: ClipboardList,
};

export default function CompactAgendaCard({
  meetings = [],
  deadlines = [],
  tasks = [],
}: CompactAgendaCardProps) {
  const days = getAgendaDays();
  const today = new Date();

  return (
    <DashboardCard variant="glass" className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Planning</h2>
          <p className="text-xs text-slate-500">7 prochains jours</p>
        </div>
        <Link
          href="/deadlines"
          className="flex items-center gap-0.5 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          Calendrier complet
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
        {days.map((day) => {
          const isToday = isSameLocalDay(day, today);
          const items = buildAgendaEventsForDay(day, meetings, deadlines, tasks, {
            skipUrgentDeadlines: isToday,
            skipTodayMeetings: isToday,
            skipTodayTasks: isToday,
          });

          return (
            <div
              key={dateKey(day)}
              className={cn(
                "rounded-2xl border px-3 py-2.5",
                isToday ? "border-slate-300/60 bg-white/90" : "border-slate-200/40 bg-white/40"
              )}
            >
              <p
                className={cn(
                  "mb-1.5 text-[11px] font-semibold uppercase tracking-wide",
                  isToday ? "text-slate-800" : "text-slate-400"
                )}
              >
                {isToday && "Aujourd'hui · "}
                {format(day, "EEE d MMM", { locale: fr })}
              </p>
              {isToday && items.length === 0 ? (
                <p className="text-[11px] text-slate-400">Voir le bloc Aujourd&apos;hui →</p>
              ) : items.length === 0 ? (
                <p className="text-[11px] text-slate-400">—</p>
              ) : (
                <ul className="space-y-1">
                  {items.slice(0, 4).map((item) => {
                    const Icon = KIND_ICON[item.kind];
                    return (
                      <li
                        key={item.id}
                        className={cn(
                          "flex items-center gap-1.5 truncate text-xs text-slate-700",
                          item.urgent && "font-medium text-orange-800"
                        )}
                      >
                        <Icon className="h-3 w-3 shrink-0 text-slate-400" />
                        {item.time && (
                          <span className="font-mono text-[10px] text-slate-400">{item.time}</span>
                        )}
                        <span className="truncate">{item.title}</span>
                      </li>
                    );
                  })}
                  {items.length > 4 && (
                    <li className="text-[10px] text-slate-400">+{items.length - 4} autres</li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
