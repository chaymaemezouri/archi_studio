"use client";

import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { ArrowUpRight, Users } from "lucide-react";
import type { Meeting } from "@/types";
import { cn } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";
import {
  dashboardLink,
  dashboardMeetingCard,
  dashboardPanel,
  dashboardPanelHeader,
  dashboardPanelTitle,
} from "./dashboard-ui";

interface DashboardTodayMeetingsProps {
  meetings: Meeting[];
  today?: Date;
  className?: string;
}

export default function DashboardTodayMeetings({
  meetings,
  today = new Date(),
  className,
}: DashboardTodayMeetingsProps) {
  const todayMeetings = meetings
    .filter((m) => isSameDay(new Date(m.date), today))
    .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));

  return (
    <section className={cn(dashboardPanel, className)}>
      <div className={dashboardPanelHeader}>
        <h2 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Réunions du jour
          {todayMeetings.length > 0 && (
            <span className="ml-1.5 text-[11px] font-normal tabular-nums text-glass-muted">
              ({todayMeetings.length})
            </span>
          )}
        </h2>
        <Link
          href="/calendar"
          className={cn(dashboardLink, "inline-flex items-center gap-0.5 text-[10px]")}
        >
          Calendrier
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="px-2 py-2">
        {todayMeetings.length === 0 ? (
          <p className="px-2 py-4 text-center text-[12px] text-glass-muted">
            Aucune réunion prévue aujourd&apos;hui.
          </p>
        ) : (
          <ul className="space-y-1">
            {todayMeetings.map((m) => (
              <li key={m.id}>
                <Link
                  href="/calendar"
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg px-3 py-2",
                    dashboardMeetingCard
                  )}
                >
                  <Users
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80"
                    strokeWidth={1.75}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{m.title}</p>
                    <p className="mt-0.5 text-[10px] opacity-75">
                      {m.startTime ?? format(new Date(m.date), "HH:mm")}
                      {m.project?.name && ` · ${m.project.name}`}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
