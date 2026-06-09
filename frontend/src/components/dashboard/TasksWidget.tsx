"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { PRIORITY_COLORS } from "@/types";
import type { Task } from "@/types";
import { formatDate } from "@/lib/utils";

interface TasksWidgetProps {
  tasks?: Task[];
}

export default function TasksWidget({ tasks }: TasksWidgetProps) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Tâches du jour</h2>
        <Link href="/dashboard" className="text-sm text-accent hover:text-accent-hover">
          Voir tout
        </Link>
      </div>

      {taskList.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">Aucune tâche pour aujourd&apos;hui</p>
      ) : (
        <ul className="space-y-3">
          {taskList.slice(0, 5).map((task) => (
            <li key={task.id} className="flex items-start gap-3 rounded-xl p-2 hover:bg-white/5">
              {task.status === "DONE" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text-primary">{task.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  {task.project?.name && (
                    <span className="text-xs text-text-secondary">{task.project.name}</span>
                  )}
                  {task.dueDate && (
                    <span className="text-xs text-text-muted">{formatDate(task.dueDate)}</span>
                  )}
                </div>
              </div>
              <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
