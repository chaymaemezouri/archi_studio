"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ListTodo, Plus } from "lucide-react";
import DashboardTaskCheckbox from "@/components/dashboard/DashboardTaskCheckbox";
import { useCreateDashboardTask, useUpdateDashboardTask } from "@/hooks/useDashboard";
import { toLocalDateInput } from "@/lib/dates";
import type { Priority, Project, Task } from "@/types";
import { cn } from "@/lib/utils";
import { accentBar, glassInput, glassSelect } from "@/lib/glass-styles";
import DashboardTaskMeta from "@/components/dashboard/DashboardTaskMeta";
import {
  dashboardLink,
  dashboardPanel,
  dashboardPanelHeader,
  dashboardPanelTitle,
} from "./dashboard-ui";

interface DashboardDayTasksProps {
  tasks: Task[];
  projects?: Project[];
  defaultDate?: Date;
  completingTaskIds?: Set<string>;
  className?: string;
}

const row =
  "flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-studio-muted/40";

export default function DashboardDayTasks({
  tasks,
  projects = [],
  defaultDate = new Date(),
  completingTaskIds = new Set(),
  className,
}: DashboardDayTasksProps) {
  const [titleInput, setTitleInput] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");

  const createTask = useCreateDashboardTask();
  const updateTask = useUpdateDashboardTask();

  const openTasks = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.status !== "DONE")
        .sort((a, b) => {
          const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
        }),
    [tasks]
  );

  const doneToday = useMemo(
    () => tasks.filter((t) => t.status === "DONE"),
    [tasks]
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    const dateStr = toLocalDateInput(defaultDate);
    await createTask.mutateAsync({
      title: titleInput.trim(),
      dueDate: dateStr,
      scheduledAt: dateStr,
      projectId: projectId || undefined,
      priority,
    });
    setTitleInput("");
    setProjectId("");
    setPriority("MEDIUM");
  };

  const inputClass = cn(
    glassInput,
    "text-[13px] placeholder:text-glass-muted"
  );
  const selectClass = cn(glassSelect, "text-[13px]");

  return (
    <section className={cn(dashboardPanel, "flex flex-col", className)}>
      <div className={dashboardPanelHeader}>
        <h2 className={dashboardPanelTitle}>
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Tâches du jour
        </h2>
        <Link
          href="/tasks"
          className={cn(dashboardLink, "inline-flex items-center gap-0.5 text-[10px]")}
        >
          Toutes les tâches
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <form
        onSubmit={handleAdd}
        className="shrink-0 space-y-2 border-b border-app px-3 py-3"
      >
        <div className="flex gap-2">
          <input
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Nouvelle tâche pour aujourd'hui…"
            className={cn(inputClass, "flex-1")}
          />
          <button
            type="submit"
            disabled={createTask.isPending || !titleInput.trim()}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-studio-border/50 bg-studio-light/[0.08] px-3 py-2 text-[12px] font-medium text-studio-light transition hover:bg-studio-light/[0.12] disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
          {projects.length > 0 && (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={selectClass}
            >
              <option value="">Sans projet</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={selectClass}
          >
            <option value="LOW">Basse</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HIGH">Haute</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </form>

      <div className="max-h-[min(72vh,36rem)] flex-1 overflow-y-auto px-1.5 py-2">
        {openTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <ListTodo className="h-8 w-8 text-glass-muted/40" strokeWidth={1.25} />
            <p className="text-[12px] text-glass-muted">
              Aucune tâche pour aujourd&apos;hui. Ajoutez-en une ci-dessus.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {openTasks.map((task) => {
              const href = task.projectId
                ? `/projects/${task.projectId}?tab=tasks`
                : "/tasks";
              const isCompleting = completingTaskIds.has(task.id);
              return (
                <li key={task.id} className={row}>
                  <DashboardTaskCheckbox
                    checked={false}
                    disabled={isCompleting}
                    onToggle={() =>
                      updateTask.mutate({ id: task.id, status: "DONE" })
                    }
                  />
                  <Link href={href} className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-glass">{task.title}</p>
                    <DashboardTaskMeta
                      status={task.status}
                      priority={task.priority}
                      projectName={task.project?.name}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {doneToday.length > 0 && (
          <div className="mt-3 border-t border-app pt-2">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-glass-muted">
              Terminées ({doneToday.length})
            </p>
            <ul className="space-y-0.5">
              {doneToday.map((task) => (
                <li key={task.id} className={cn(row, "opacity-60")}>
                  <DashboardTaskCheckbox
                    checked
                    onToggle={() =>
                      updateTask.mutate({ id: task.id, status: "TODO" })
                    }
                  />
                  <span className="truncate text-[12px] text-glass-muted line-through">
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
