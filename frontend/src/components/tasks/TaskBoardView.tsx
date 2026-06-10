"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import { detailIconActionGroup } from "@/components/projects/detail/project-detail-ui";
import Badge from "@/components/ui/Badge";
import { useDialog } from "@/components/providers/DialogProvider";
import { useCompleteTask, useDeleteTask } from "@/hooks/useTasks";
import type { Task, TaskStatus } from "@/types";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import { getTaskDeadlineBadge, TASK_DEADLINE_BADGE_LABELS } from "@/lib/tasks-list";
import {
  taskBoardDeadlineAccent,
  taskDeadlineBadgeVariant,
  tasksBoardCard,
  tasksBoardColumn,
} from "./tasks-list-ui";
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
            <h3 className="mb-2.5 text-[12px] font-semibold text-glass">
              {col.label}
              <span className="ml-1.5 text-[10px] font-normal text-glass-muted">
                ({colTasks.length})
              </span>
            </h3>
            <div className="space-y-1.5">
              {colTasks.length === 0 ? (
                <p className="py-4 text-center text-[11px] text-glass-muted">Aucune tâche</p>
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
  const { confirm } = useDialog();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const deadlineBadge = getTaskDeadlineBadge(task);
  const canComplete = task.status !== "DONE" && task.status !== "CANCELLED";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !(await confirm({
        title: "Supprimer la tâche",
        message: `Supprimer la tâche « ${task.title} » ?`,
        confirmLabel: "Supprimer",
        variant: "danger",
      }))
    ) {
      return;
    }
    deleteTask.mutate(task.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(task);
        }
      }}
      className={cn(tasksBoardCard, taskBoardDeadlineAccent(deadlineBadge), "cursor-pointer")}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "min-w-0 flex-1 text-[13px] font-medium text-glass",
            task.status === "DONE" && "line-through"
          )}
        >
          {task.title}
        </p>
        <div
          className={detailIconActionGroup}
          role="group"
          aria-label="Actions tâche"
          onClick={(e) => e.stopPropagation()}
        >
          {canComplete && (
            <IconActionButton
              label="Terminer"
              icon={CheckCircle2}
              tone="success"
              disabled={completeTask.isPending}
              onClick={(e) => {
                e.stopPropagation();
                completeTask.mutate(task.id);
              }}
            />
          )}
          <IconActionButton
            label="Supprimer"
            icon={Trash2}
            tone="danger"
            disabled={deleteTask.isPending}
            onClick={handleDelete}
          />
        </div>
      </div>
      {(task.projectName ?? task.project?.name) && (
        <p className="mt-1 text-[11px] text-glass-muted">
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
          <span className="text-[10px] text-glass-muted">{formatDate(task.dueDate)}</span>
        )}
        <Badge variant={task.status === "DONE" ? "success" : "studio"}>
          {TASK_STATUS_LABELS[task.status]}
        </Badge>
      </div>
    </div>
  );
}
