"use client";

import Link from "next/link";
import TaskRow, { TaskListHeader } from "./TaskRow";
import { tasksListTable, tasksShell } from "./tasks-list-ui";
import type { TaskProjectGroup } from "@/lib/tasks-list";
import type { Task } from "@/types";
import { accentBar } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface TaskProjectSectionProps {
  group: TaskProjectGroup;
  onEdit: (task: Task) => void;
}

export default function TaskProjectSection({ group, onEdit }: TaskProjectSectionProps) {
  const href = group.projectId ? `/projects/${group.projectId}?tab=tasks` : undefined;
  const count = group.tasks.length;

  return (
    <section className={cn(tasksShell, "space-y-3 p-3 sm:p-4")}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-app pb-2.5">
        <div className="min-w-0">
          {href ? (
            <Link
              href={href}
              className="flex items-center gap-2 text-[15px] font-semibold text-app-primary transition hover:text-studio-light"
            >
              <span className={cn(accentBar, "h-3.5")} aria-hidden />
              <span className="truncate">{group.projectName}</span>
            </Link>
          ) : (
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-app-primary">
              <span className={cn(accentBar, "h-3.5")} aria-hidden />
              <span className="truncate">{group.projectName}</span>
            </h2>
          )}
          <p className="mt-0.5 pl-3 text-[11px] text-glass-muted">
            {count} tâche{count !== 1 ? "s" : ""}
            {group.isPersonal
              ? " · sans projet associé"
              : group.clientName
                ? ` · ${group.clientName}`
                : null}
          </p>
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-[11px] font-medium text-glass-muted transition hover:text-studio-light"
          >
            Voir le projet →
          </Link>
        )}
      </header>

      {count === 0 ? (
        <p className="px-2 py-4 text-center text-[12px] text-glass-muted">
          Aucune tâche dans ce groupe.
        </p>
      ) : (
        <div className={tasksListTable}>
          <TaskListHeader />
          {group.tasks.map((task) => (
            <TaskRow key={task.id} task={task} onEdit={onEdit} />
          ))}
        </div>
      )}
    </section>
  );
}
