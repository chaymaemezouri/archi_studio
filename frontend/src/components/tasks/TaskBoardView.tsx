"use client";

import Badge from "@/components/ui/Badge";
import type { Task, TaskStatus } from "@/types";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import { getTaskDeadlineBadge, TASK_DEADLINE_BADGE_LABELS } from "@/lib/tasks-list";
import { taskDeadlineBadgeVariant, tasksBoardCard, tasksBoardColumn } from "./tasks-list-ui";
import { cn, formatDate } from "@/lib/utils";

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "TODO", label: "À faire" },
  { id: "IN_PROGRESS", label: "En cours" },
  { id: "DONE", label: "Terminée" },
];

interface TaskBoardViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export default function TaskBoardView({ tasks, onEdit }: TaskBoardViewProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className={tasksBoardColumn}>
            <h3 className="mb-2.5 text-[12px] font-semibold text-[#e8edf4]/88">
              {col.label}
              <span className="ml-1.5 text-[10px] font-normal text-[#8ba4c7]/45">
                ({colTasks.length})
              </span>
            </h3>
            <div className="space-y-1.5">
              {colTasks.length === 0 ? (
                <p className="py-4 text-center text-[11px] text-[#8ba4c7]/38">Aucune tâche</p>
              ) : (
                colTasks.map((task) => (
                  <BoardCard key={task.id} task={task} onEdit={onEdit} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BoardCard({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const deadlineBadge = getTaskDeadlineBadge(task);

  return (
    <button
      type="button"
      onClick={() => onEdit(task)}
      className={cn(
        tasksBoardCard,
        deadlineBadge === "overdue" && "border-l-red-400/25",
        deadlineBadge === "today" && "border-l-amber-400/25",
        (deadlineBadge === "tomorrow" || deadlineBadge === "soon") &&
          "border-l-[#8ba4c7]/22"
      )}
    >
      <p
        className={cn(
          "text-[13px] font-medium text-[#e8edf4]/88",
          task.status === "DONE" && "line-through"
        )}
      >
        {task.title}
      </p>
      {(task.projectName ?? task.project?.name) && (
        <p className="mt-1 text-[11px] text-[#9aa3b0]/50">
          {task.projectName ?? task.project?.name}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge variant={task.priority === "URGENT" ? "danger" : "default"}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        {deadlineBadge !== "none" && (
          <Badge variant={taskDeadlineBadgeVariant(deadlineBadge)}>
            {TASK_DEADLINE_BADGE_LABELS[deadlineBadge]}
          </Badge>
        )}
        {task.dueDate && (
          <span className="text-[10px] text-[#8ba4c7]/40">{formatDate(task.dueDate)}</span>
        )}
        <Badge variant={task.status === "DONE" ? "success" : "studio"}>
          {TASK_STATUS_LABELS[task.status]}
        </Badge>
      </div>
    </button>
  );
}
