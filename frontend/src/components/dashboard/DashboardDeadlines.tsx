"use client";

import Link from "next/link";
import { CalendarClock, Check } from "lucide-react";
import DashboardCard from "./DashboardCard";
import DeadlineStatusBadge from "./DeadlineStatusBadge";
import Tooltip from "@/components/ui/Tooltip";
import { useUpdateDeadline } from "@/hooks/useDashboard";
import type { Deadline } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  dashboardBottomCard,
  dashboardCardTitle,
  dashboardEmptyCompact,
  dashboardEmptyIconSm,
  dashboardLink,
  dashboardIconBtn,
} from "./dashboard-ui";

interface DashboardDeadlinesProps {
  deadlines?: Deadline[];
  limit?: number;
  onAddDeadline?: () => void;
}

export default function DashboardDeadlines({
  deadlines = [],
  limit = 3,
  onAddDeadline,
}: DashboardDeadlinesProps) {
  const updateDeadline = useUpdateDeadline();
  const open = deadlines.filter((d) => !d.done);
  const isEmpty = open.length === 0;

  return (
    <DashboardCard className={cn(dashboardBottomCard, isEmpty && "!min-h-0")}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className={dashboardCardTitle}>Deadlines à venir</h2>
        {!isEmpty && (
          <Link href="/deadlines" className={dashboardLink}>
            Voir tout
          </Link>
        )}
      </div>

      {isEmpty ? (
        <div className={dashboardEmptyCompact}>
          <div className={dashboardEmptyIconSm}>
            <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <p className="text-[11px] font-medium text-stone-600">Aucune deadline à venir</p>
          <p className="mt-0.5 text-[10px] text-stone-400">Ajoutez une deadline à vos projets</p>
          {onAddDeadline && (
            <button
              type="button"
              onClick={onAddDeadline}
              className="mt-1.5 text-[10px] font-medium text-[#B85C15] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Ajouter une deadline
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {open.slice(0, limit).map((deadline) => (
            <li
              key={deadline.id}
              className="flex items-center gap-2 rounded-lg border border-stone-100/90 bg-stone-50/30 px-2.5 py-2 transition hover:bg-stone-50/60"
            >
              <Tooltip label="Marquer comme fait">
                <button
                  type="button"
                  onClick={() => updateDeadline.mutate({ id: deadline.id, done: true })}
                  className={cn(dashboardIconBtn, "shrink-0 !p-1.5")}
                  aria-label="Marquer comme fait"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-600/90" />
                </button>
              </Tooltip>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1">
                  <p className="truncate text-[11px] font-medium text-stone-800">{deadline.title}</p>
                  <DeadlineStatusBadge
                    date={deadline.date}
                    done={deadline.done}
                    showOverdueDetail
                    className="!px-1.5 !py-px !text-[9px]"
                  />
                </div>
                <p className="text-[10px] text-stone-500">
                  {deadline.project?.name && `${deadline.project.name} · `}
                  {formatDate(deadline.date)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
