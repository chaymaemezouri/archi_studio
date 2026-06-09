"use client";

import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { useMemo } from "react";
import DashboardCard from "./DashboardCard";
import { groupRecentActivities } from "./dashboard-helpers";
import type { ActivityLog } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  dashboardBottomCard,
  dashboardCardTitle,
  dashboardEmptyCompact,
  dashboardEmptyIconSm,
  dashboardLink,
} from "./dashboard-ui";

interface DashboardActivityProps {
  activities?: ActivityLog[];
  limit?: number;
}

export default function DashboardActivity({
  activities = [],
  limit = 3,
}: DashboardActivityProps) {
  const grouped = useMemo(
    () => groupRecentActivities(activities, limit),
    [activities, limit]
  );
  const isEmpty = grouped.length === 0;

  return (
    <DashboardCard className={cn(dashboardBottomCard, isEmpty && "!min-h-0")}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className={dashboardCardTitle}>Activité récente</h2>
        {!isEmpty && (
          <Link href="/projects" className={cn(dashboardLink, "shrink-0")}>
            Voir toute l&apos;activité
          </Link>
        )}
      </div>

      {isEmpty ? (
        <div className={dashboardEmptyCompact}>
          <div className={dashboardEmptyIconSm}>
            <FolderKanban className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <p className="text-[11px] text-stone-500">Aucune activité récente</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {grouped.map((item) => (
            <li
              key={item.id}
              className="flex gap-2 border-b border-stone-100/70 pb-2 last:border-0 last:pb-0"
            >
              <div className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-stone-100/90">
                <FolderKanban className="h-2.5 w-2.5 text-stone-500" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[11px] leading-snug text-stone-700">{item.label}</p>
                <p className="mt-px text-[10px] text-stone-400">
                  {formatRelativeTime(item.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
