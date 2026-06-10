"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ListTodo, Plus } from "lucide-react";
import DashboardTaskCheckbox from "@/components/dashboard/DashboardTaskCheckbox";
import { useUpdateDashboardTask } from "@/hooks/useDashboard";
import type { Task } from "@/types";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";
import Badge from "@/components/ui/Badge";
import {
  dashboardLink,
  dashboardPanel,
  dashboardPanelHeader,
  dashboardPanelTitle,
} from "./dashboard-ui";

interface DashboardTomorrowTasksProps {
  tasks: Task[];
  onAddTomorrow?: () => void;
  className?: string;
}

const row =
  "flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-studio-muted/40";

export default function DashboardTomorrowTasks({
  tasks,
  onAddTomorrow,
  className,
}: DashboardTomorrowTasksProps) {
  const updateTask = useUpdateDashboardTask();
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  const openTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== "DONE")
        .sort((a, b) => {
          const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
        }),
    [tasks]
  );

  const handleComplete = (taskId: string) => {
    setCompletingIds((prev) => new Set(prev).add(taskId));
    updateTask.mutate(
      { id: taskId, status: "DONE" },
      {
        onSettled: () => {
          setCompletingIds((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
        },
      }
    );
  };

  return (
    <section className={cn(dashboardPanel, className)}>
      <div className={dashboardPanelHeader}>
        <h2 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Demain
          {openTasks.length > 0 && (
            <span className="ml-1.5 text-[11px] font-normal tabular-nums text-glass-muted">
              ({openTasks.length})
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {onAddTomorrow && (
            <button
              type="button"
              onClick={onAddTomorrow}
              className="inline-flex items-center gap-1 rounded-md border border-studio-border/40 px-2 py-1 text-[10px] font-medium text-studio-light transition hover:bg-studio-light/[0.08]"
            >
              <Plus className="h-3 w-3" />
              Ajouter
            </button>
          )}
          <Link
            href="/tasks"
            className={cn(dashboardLink, "inline-flex items-center gap-0.5 text-[10px]")}
          >
            Tâches
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto px-1.5 py-2">
        {openTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-5 text-center">
            <ListTodo className="h-7 w-7 text-glass-muted/40" strokeWidth={1.25} />
            <p className="text-[11px] text-glass-muted">Rien de prévu pour demain.</p>
            {onAddTomorrow && (
              <button
                type="button"
                onClick={onAddTomorrow}
                className="text-[11px] font-medium text-studio-light hover:underline"
              >
                Planifier une tâche
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-0.5">
            {openTasks.map((task) => {
              const href = task.projectId
                ? `/projects/${task.projectId}?tab=tasks`
                : "/tasks";
              const isCompleting = completingIds.has(task.id);
              return (
                <li key={task.id} className={row}>
                  <DashboardTaskCheckbox
                    checked={false}
                    disabled={isCompleting}
                    onToggle={() => handleComplete(task.id)}
                  />
                  <Link href={href} className="min-w-0 flex-1">
                    <p className="truncate text-[12px] text-glass">{task.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      <Badge variant="studio">{TASK_STATUS_LABELS[task.status]}</Badge>
                      {(task.priority === "URGENT" || task.priority === "HIGH") && (
                        <Badge
                          variant={task.priority === "URGENT" ? "danger" : "warning"}
                        >
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>
                      )}
                      {(task.projectName ?? task.project?.name) && (
                        <span className="truncate text-[10px] text-glass-muted">
                          {task.projectName ?? task.project?.name}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
