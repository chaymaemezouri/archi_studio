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
import DashboardCard from "./DashboardCard";
import { useUpdateDashboardTask, useUpdateDeadline } from "@/hooks/useDashboard";
import type { SmartAlert } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES = {
  overdue: {
    border: "border-red-300 bg-red-50",
    badge: "bg-red-500 text-white",
    label: "En retard",
  },
  today: {
    border: "border-amber-300 bg-amber-50",
    badge: "bg-amber-500 text-white",
    label: "Aujourd'hui",
  },
  tomorrow: {
    border: "border-sky-200 bg-sky-50",
    badge: "bg-sky-500 text-white",
    label: "Demain",
  },
  soon: {
    border: "border-stone-200 bg-stone-50",
    badge: "bg-stone-500 text-white",
    label: "Bientôt",
  },
};

function KindIcon({ kind }: { kind: SmartAlert["kind"] }) {
  if (kind === "meeting") return <Users className="h-4 w-4 text-sky-600" />;
  if (kind === "deadline") return <CalendarClock className="h-4 w-4 text-orange-600" />;
  return <ClipboardList className="h-4 w-4 text-emerald-600" />;
}

interface DashboardSmartAlertsProps {
  alerts?: SmartAlert[];
}

export default function DashboardSmartAlerts({ alerts = [] }: DashboardSmartAlertsProps) {
  const updateTask = useUpdateDashboardTask();
  const updateDeadline = useUpdateDeadline();

  const urgent = alerts.filter((a) => a.severity === "overdue" || a.severity === "today");
  const display = urgent.length > 0 ? urgent : alerts.slice(0, 8);

  if (alerts.length === 0) {
    return (
      <DashboardCard className="border-emerald-200 bg-emerald-50/50">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <div>
            <p className="font-semibold text-stone-900">Rien d&apos;urgent</p>
            <p className="text-sm text-stone-600">
              Aucune tâche, réunion ou deadline critique pour le moment.
            </p>
          </div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-stone-100 bg-stone-900 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h2 className="font-semibold">À ne pas oublier</h2>
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold">
            {urgent.length || display.length}
          </span>
        </div>
        <Link href="/notifications" className="text-xs text-stone-300 hover:text-white">
          Toutes les alertes →
        </Link>
      </div>

      <ul className="divide-y divide-stone-100">
        {display.map((alert) => {
          const style = SEVERITY_STYLES[alert.severity];
          const href =
            alert.kind === "deadline"
              ? "/deadlines"
              : alert.projectId
                ? `/projects/${alert.projectId}`
                : "/dashboard";

          return (
            <li
              key={alert.id}
              className={cn("flex items-center gap-3 px-5 py-3", style.border)}
            >
              <KindIcon kind={alert.kind} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", style.badge)}>
                    {style.label}
                  </span>
                  <span className="text-xs text-stone-500">
                    {alert.kind === "meeting" ? "Réunion" : alert.kind === "deadline" ? "Deadline" : "Tâche"}
                  </span>
                </div>
                <p className="mt-0.5 font-medium text-stone-900">{alert.title}</p>
                <p className="text-xs text-stone-500">
                  {alert.time && `${alert.time} · `}
                  {formatDate(alert.date)}
                  {alert.subtitle && ` · ${alert.subtitle}`}
                  {" · "}
                  {formatRelativeTime(alert.date)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {alert.kind === "task" && (
                  <button
                    type="button"
                    title="Marquer terminée"
                    onClick={() =>
                      updateTask.mutate({ id: alert.entityId, status: "DONE" })
                    }
                    className="rounded-lg border border-stone-200 p-2 hover:bg-white"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </button>
                )}
                {alert.kind === "deadline" && (
                  <button
                    type="button"
                    title="Marquer faite"
                    onClick={() =>
                      updateDeadline.mutate({ id: alert.entityId, done: true })
                    }
                    className="rounded-lg border border-stone-200 p-2 hover:bg-white"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </button>
                )}
                <Link
                  href={href}
                  className="rounded-lg border border-stone-200 p-2 hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4 text-stone-500" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
