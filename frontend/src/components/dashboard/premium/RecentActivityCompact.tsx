"use client";

import Link from "next/link";
import { FolderKanban } from "lucide-react";
import type { ActivityLog } from "@/types";
import { formatActivityLabel, formatRelativeTime } from "@/lib/utils";

interface RecentActivityCompactProps {
  activities?: ActivityLog[];
}

export default function RecentActivityCompact({
  activities = [],
}: RecentActivityCompactProps) {
  const items = activities.slice(0, 4);
  if (items.length === 0) return null;

  return (
    <div className="border-t border-slate-200/50 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-600">Activité récente</h2>
        <Link
          href="/activity"
          className="text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          Voir toute l&apos;activité →
        </Link>
      </div>
      <ul className="space-y-2">
        {items.map((activity) => (
          <li key={activity.id} className="flex gap-2 text-xs text-slate-600">
            <FolderKanban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="truncate">{formatActivityLabel(activity)}</p>
              <p className="text-[10px] text-slate-400">{formatRelativeTime(activity.createdAt)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
