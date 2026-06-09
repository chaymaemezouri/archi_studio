"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { PRIORITY_COLORS } from "@/types";
import type { Deadline } from "@/types";
import { formatDate } from "@/lib/utils";

interface DeadlinesWidgetProps {
  deadlines?: Deadline[];
}

export default function DeadlinesWidget({ deadlines }: DeadlinesWidgetProps) {
  const deadlineList = Array.isArray(deadlines) ? deadlines : [];
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Deadlines à venir</h2>
        <Link href="/deadlines" className="text-sm text-accent hover:text-accent-hover">
          Voir tout
        </Link>
      </div>

      {deadlineList.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">Aucune deadline proche</p>
      ) : (
        <ul className="space-y-3">
          {deadlineList.slice(0, 5).map((deadline) => (
            <li
              key={deadline.id}
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5"
            >
              <div className="rounded-lg bg-accent-muted p-2">
                <CalendarClock className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text-primary">{deadline.title}</p>
                <p className="text-xs text-text-secondary">
                  {deadline.project?.name && `${deadline.project.name} · `}
                  {formatDate(deadline.date)}
                </p>
              </div>
              <Badge className={PRIORITY_COLORS[deadline.priority]}>{deadline.priority}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
