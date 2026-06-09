"use client";

import Link from "next/link";
import { addDays, format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarClock, ClipboardList, Users } from "lucide-react";
import DashboardCard from "./DashboardCard";
import type { Deadline, Meeting, Task } from "@/types";
import { dateKey, isSameLocalDay, isUrgentDeadline } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface DashboardAgendaProps {
  meetings?: Meeting[];
  deadlines?: Deadline[];
  tasks?: Task[];
}

const KIND_STYLES = {
  meeting: "bg-sky-50/90 border-sky-100",
  deadline: "bg-orange-50/90 border-orange-100",
  task: "bg-emerald-50/90 border-emerald-100",
};

type AgendaItem = {
  id: string;
  kind: "meeting" | "deadline" | "task";
  title: string;
  time?: string | null;
  projectName?: string;
  urgent?: boolean;
};

export default function DashboardAgenda({
  meetings = [],
  deadlines = [],
  tasks = [],
}: DashboardAgendaProps) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

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
        });
      }
    }
    for (const t of tasks) {
      const td = t.dueDate ?? t.scheduledAt;
      if (td && isSameLocalDay(td, day) && t.status !== "DONE") {
        items.push({
          id: `t-${t.id}`,
          kind: "task",
          title: t.title,
          projectName: t.project?.name,
        });
      }
    }
    return items.sort((a, b) => (a.time && b.time ? a.time.localeCompare(b.time) : 0));
  };

  return (
    <DashboardCard variant="glass" className="h-full !p-6">
      <h2 className="text-lg font-medium text-slate-900">Agenda — 7 prochains jours</h2>
      <p className="mt-1 text-sm text-slate-500">Vue chronologique de votre planning</p>

      <div className="mt-6 space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {days.map((day) => {
          const items = itemsForDay(day);
          const isToday = isSameLocalDay(day, today);

          return (
            <div
              key={dateKey(day)}
              className={cn(
                "rounded-2xl border p-4",
                isToday
                  ? "border-slate-900/15 bg-white/90 shadow-sm"
                  : "border-slate-200/50 bg-white/40"
              )}
            >
              <p
                className={cn(
                  "mb-3 text-xs font-semibold uppercase tracking-wide",
                  isToday ? "text-slate-900" : "text-slate-400"
                )}
              >
                {isToday && "Aujourd'hui · "}
                {format(day, "EEEE d MMM", { locale: fr })}
              </p>
              {items.length === 0 ? (
                <p className="text-xs text-slate-400">Aucun événement</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className={cn(
                        "flex items-start gap-2 rounded-xl border px-3 py-2 text-sm",
                        KIND_STYLES[item.kind],
                        item.urgent && "ring-1 ring-red-200"
                      )}
                    >
                      {item.kind === "meeting" && (
                        <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
                      )}
                      {item.kind === "deadline" && (
                        <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" />
                      )}
                      {item.kind === "task" && (
                        <ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      )}
                      <span className="min-w-0 text-slate-800">
                        {item.time && (
                          <span className="font-mono text-xs text-slate-500">{item.time} </span>
                        )}
                        {item.title}
                        {item.projectName && (
                          <span className="text-slate-400"> · {item.projectName}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <Link
        href="/deadlines"
        className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        Gérer toutes les dates →
      </Link>
    </DashboardCard>
  );
}
