"use client";

import {
  formatOverdueDays,
  getDeadlineUrgency,
  type DeadlineUrgency,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

const STYLES: Record<Exclude<DeadlineUrgency, "normal">, string> = {
  overdue: "bg-red-500/15 text-red-300 ring-red-400/25",
  today: "bg-rose-500/12 text-rose-300 ring-rose-400/20",
  soon: "bg-amber-500/12 text-amber-300 ring-amber-400/20",
};

const LABELS: Record<Exclude<DeadlineUrgency, "normal">, string> = {
  overdue: "En retard",
  today: "Aujourd'hui",
  soon: "Bientôt",
};

interface DeadlineStatusBadgeProps {
  date: string;
  done?: boolean;
  showOverdueDetail?: boolean;
  className?: string;
}

export default function DeadlineStatusBadge({
  date,
  done,
  showOverdueDetail,
  className,
}: DeadlineStatusBadgeProps) {
  const urgency = getDeadlineUrgency(date, done);
  if (urgency === "normal") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 backdrop-blur-sm",
        STYLES[urgency],
        className
      )}
    >
      {urgency === "overdue" && showOverdueDetail
        ? formatOverdueDays(date)
        : LABELS[urgency]}
    </span>
  );
}
