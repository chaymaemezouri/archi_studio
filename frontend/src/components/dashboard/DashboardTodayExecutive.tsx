"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Sparkles,
  Target,
} from "lucide-react";
import DashboardCard from "./DashboardCard";
import DeadlineStatusBadge from "./DeadlineStatusBadge";
import { useUpdateDashboardTask, useUpdateDeadline } from "@/hooks/useDashboard";
import type { TodayExecutiveBrief } from "./dashboard-executive";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { dashboardCardTitle } from "./dashboard-ui";

interface DashboardTodayExecutiveProps {
  brief: TodayExecutiveBrief;
}

function Row({
  icon: Icon,
  label,
  title,
  meta,
  trailing,
  href,
}: {
  icon: typeof Target;
  label: string;
  title: string;
  meta?: string;
  trailing?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex gap-3 rounded-[18px] border border-stone-100/90 bg-stone-50/40 px-3.5 py-3 transition hover:border-stone-200/80 hover:bg-white/80">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-stone-200/60">
        <Icon className="h-4 w-4 text-[#C4651A]" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-stone-900">{title}</p>
        {meta && <p className="mt-0.5 text-xs text-stone-500">{meta}</p>}
      </div>
      {trailing}
      {href && (
        <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-stone-300" aria-hidden />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400">
        {content}
      </Link>
    );
  }
  return content;
}

export default function DashboardTodayExecutive({ brief }: DashboardTodayExecutiveProps) {
  const updateDeadline = useUpdateDeadline();
  const updateTask = useUpdateDashboardTask();

  return (
    <DashboardCard className="!p-4 sm:!p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className={cn(dashboardCardTitle, "text-[15px] text-stone-900")}>
            Aujourd&apos;hui
          </h2>
          <p className="mt-0.5 text-xs text-stone-500">{brief.summaryLine}</p>
        </div>
        <Sparkles className="h-5 w-5 shrink-0 text-amber-400/80" strokeWidth={1.5} />
      </div>

      {brief.isCalm ? (
        <div className="rounded-[20px] border border-emerald-100/80 bg-emerald-50/50 px-4 py-5 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/90" strokeWidth={1.5} />
          <p className="mt-2 text-sm font-medium text-emerald-900/90">
            Aucune urgence aujourd&apos;hui.
          </p>
          <p className="mt-1 text-xs text-emerald-800/70">
            Profitez de cette journée pour avancer sereinement sur vos projets.
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-1 lg:grid-cols-3">
          {brief.urgentDeadline ? (
            <Row
              icon={CalendarClock}
              label="Prochaine deadline urgente"
              title={brief.urgentDeadline.title}
              meta={[
                brief.urgentDeadline.project?.name,
                formatDate(brief.urgentDeadline.date, "d MMM"),
              ]
                .filter(Boolean)
                .join(" · ")}
              trailing={
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <DeadlineStatusBadge date={brief.urgentDeadline.date} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      updateDeadline.mutate({
                        id: brief.urgentDeadline!.id,
                        done: true,
                      });
                    }}
                    className="text-[10px] font-medium text-stone-600 hover:text-stone-900"
                  >
                    Marquer fait
                  </button>
                </div>
              }
            />
          ) : (
            <div className="rounded-[18px] border border-dashed border-stone-200/90 bg-stone-50/30 px-3.5 py-4 text-center text-xs text-stone-400">
              Pas de deadline urgente
            </div>
          )}

          {brief.importantTask ? (
            <div className="rounded-[18px] border border-stone-100/90 bg-stone-50/40 px-3.5 py-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateTask.mutate({
                      id: brief.importantTask!.id,
                      status:
                        brief.importantTask!.status === "DONE" ? "TODO" : "DONE",
                    })
                  }
                  className="mt-1 shrink-0"
                >
                  {brief.importantTask.status === "DONE" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-stone-300" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                    Tâche importante du jour
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-stone-900">
                    {brief.importantTask.title}
                  </p>
                  {brief.importantTask.project?.name && (
                    <p className="mt-0.5 text-xs text-stone-500">
                      {brief.importantTask.project.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-stone-200/90 bg-stone-50/30 px-3.5 py-4 text-center text-xs text-stone-400">
              Aucune tâche prioritaire
            </div>
          )}

          {brief.recommendedAction ? (
            <Row
              icon={Target}
              label="Prochaine action recommandée"
              title={brief.recommendedAction.label}
              meta={brief.recommendedAction.detail}
              href={brief.recommendedAction.href}
            />
          ) : (
            <div className="rounded-[18px] border border-dashed border-stone-200/90 bg-stone-50/30 px-3.5 py-4 text-center text-xs text-stone-400">
              Rien de critique à signaler
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
