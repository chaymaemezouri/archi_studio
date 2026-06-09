"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Users,
} from "lucide-react";
import DashboardCard from "../DashboardCard";
import { useUpdateDashboardTask, useUpdateDeadline } from "@/hooks/useDashboard";
import type { Notification, SmartAlert } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const KIND_BADGE = {
  meeting: "bg-sky-100 text-sky-700",
  deadline: "bg-orange-100 text-orange-700",
  task: "bg-emerald-100 text-emerald-700",
};

const SEVERITY_DOT = {
  overdue: "bg-red-500",
  today: "bg-amber-500",
  tomorrow: "bg-sky-400",
  soon: "bg-slate-300",
};

interface AlertsCardProps {
  alerts?: SmartAlert[];
  notifications?: Notification[];
}

export default function AlertsCard({ alerts = [], notifications = [] }: AlertsCardProps) {
  const updateTask = useUpdateDashboardTask();
  const updateDeadline = useUpdateDeadline();

  const priority = alerts.filter((a) => a.severity === "overdue" || a.severity === "today");
  const display = priority.length > 0 ? priority.slice(0, 6) : alerts.slice(0, 4);

  if (display.length === 0 && notifications.length === 0) {
    return (
      <DashboardCard variant="glass" className="!p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/80">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-900">À ne pas oublier</h2>
            <p className="text-sm text-slate-500">Rien d&apos;urgent pour le moment.</p>
          </div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard variant="glass" className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100/90">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-900">À ne pas oublier</h2>
            <p className="text-xs text-slate-500">Priorités du jour</p>
          </div>
        </div>
        <Link
          href="/notifications"
          className="flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          Toutes les alertes
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <ul className="divide-y divide-slate-100/80">
        {display.map((alert) => (
          <li
            key={alert.id}
            className="flex items-center gap-4 px-6 py-4 transition hover:bg-white/50"
          >
            <span
              className={cn("h-2 w-2 shrink-0 rounded-full", SEVERITY_DOT[alert.severity])}
            />
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100/80">
              {alert.kind === "meeting" && <Users className="h-4 w-4 text-sky-600" />}
              {alert.kind === "deadline" && (
                <CalendarClock className="h-4 w-4 text-orange-600" />
              )}
              {alert.kind === "task" && (
                <ClipboardList className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    KIND_BADGE[alert.kind]
                  )}
                >
                  {alert.kind === "meeting"
                    ? "Réunion"
                    : alert.kind === "deadline"
                      ? "Deadline"
                      : "Tâche"}
                </span>
              </div>
              <p className="mt-0.5 font-medium text-slate-900">{alert.title}</p>
              <p className="text-xs text-slate-500">
                {formatDate(alert.date)}
                {alert.subtitle && ` · ${alert.subtitle}`}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              {alert.kind === "task" && (
                <button
                  type="button"
                  onClick={() => updateTask.mutate({ id: alert.entityId, status: "DONE" })}
                  className="rounded-xl border border-slate-200/80 bg-white/80 p-2 text-xs hover:bg-white"
                  title="Terminer"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </button>
              )}
              {alert.kind === "deadline" && !alert.done && (
                <button
                  type="button"
                  onClick={() => updateDeadline.mutate({ id: alert.entityId, done: true })}
                  className="rounded-xl border border-slate-200/80 bg-white/80 p-2 hover:bg-white"
                  title="Marquer faite"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
