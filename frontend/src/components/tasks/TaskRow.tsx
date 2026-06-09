"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  MoreVertical,
  Pencil,
  PlayCircle,
  Trash2,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import {
  useCompleteTask,
  useDeleteTask,
  useDuplicateTask,
  useUpdateTaskStatus,
} from "@/hooks/useTasks";
import {
  getTaskDeadlineBadge,
  isTaskClosed,
  TASK_DEADLINE_BADGE_LABELS,
} from "@/lib/tasks-list";
import type { Task } from "@/types";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import {
  taskDeadlineBadgeVariant,
  tasksListHeader,
  tasksListLink,
  tasksListRow,
} from "./tasks-list-ui";
import { glassBtnIcon, glassMenu } from "@/lib/glass-styles";
import { cn, formatDate } from "@/lib/utils";

interface TaskRowProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskListHeader() {
  return (
    <div className={tasksListHeader}>
      <span>Tâche</span>
      <span>Projet</span>
      <span>Client</span>
      <span>Deadline</span>
      <span>Priorité</span>
      <span>Statut</span>
      <span />
    </div>
  );
}

export default function TaskRow({ task, onEdit }: TaskRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const completeTask = useCompleteTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const duplicateTask = useDuplicateTask();

  const deadlineBadge = getTaskDeadlineBadge(task);
  const closed = isTaskClosed(task.status);
  const projectName = task.projectName ?? task.project?.name;
  const clientName = task.clientName ?? task.project?.client?.name;

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleDelete = () => {
    if (!window.confirm(`Supprimer la tâche « ${task.title} » ?`)) return;
    deleteTask.mutate(task.id);
    setMenuOpen(false);
  };

  return (
    <div className={cn(tasksListRow, closed && "opacity-65")}>
      <div className="min-w-0">
        <p
          className={cn(
            "font-medium text-glass",
            task.status === "DONE" && "line-through"
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-[#9aa3b0]/50">
            {task.description}
          </p>
        )}
        {deadlineBadge !== "none" && (
          <Badge variant={taskDeadlineBadgeVariant(deadlineBadge)} className="mt-1">
            {TASK_DEADLINE_BADGE_LABELS[deadlineBadge]}
          </Badge>
        )}
      </div>

      <span className="text-glass-secondary">
        <span className="text-[10px] text-glass-muted md:hidden">Projet · </span>
        {task.projectId && projectName ? (
          <Link href={`/projects/${task.projectId}?tab=tasks`} className={tasksListLink}>
            {projectName}
          </Link>
        ) : (
          "Personnelle"
        )}
      </span>

      <span className="text-glass-secondary">
        <span className="text-[10px] text-glass-muted md:hidden">Client · </span>
        {task.clientId && clientName ? (
          <Link href={`/clients/${task.clientId}`} className={tasksListLink}>
            {clientName}
          </Link>
        ) : (
          "—"
        )}
      </span>

      <span className="text-glass-secondary">
        <span className="text-[10px] text-glass-muted md:hidden">Deadline · </span>
        {task.dueDate ? formatDate(task.dueDate) : TASK_DEADLINE_BADGE_LABELS.none}
      </span>

      <span>
        <Badge variant={task.priority === "URGENT" ? "danger" : "default"}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
      </span>

      <span>
        <Badge variant={task.status === "DONE" ? "success" : "studio"}>
          {TASK_STATUS_LABELS[task.status]}
        </Badge>
      </span>

      <div ref={ref} className="relative justify-self-end">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(glassBtnIcon, "h-8 w-8 border-0")}
          aria-label="Actions tâche"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className={cn(glassMenu, "absolute right-0 top-full z-20 mt-1 w-48")}>
            <MenuBtn onClick={() => { onEdit(task); setMenuOpen(false); }}>
              <Pencil className="h-4 w-4" /> Modifier
            </MenuBtn>
            {task.status !== "IN_PROGRESS" && task.status !== "DONE" && (
              <MenuBtn
                onClick={() => {
                  updateStatus.mutate({ id: task.id, status: "IN_PROGRESS" });
                  setMenuOpen(false);
                }}
              >
                <PlayCircle className="h-4 w-4" /> En cours
              </MenuBtn>
            )}
            {task.status !== "DONE" && (
              <MenuBtn
                onClick={() => {
                  completeTask.mutate(task.id);
                  setMenuOpen(false);
                }}
              >
                <CheckCircle2 className="h-4 w-4" /> Terminer
              </MenuBtn>
            )}
            {task.projectId && (
              <Link
                href={`/projects/${task.projectId}?tab=tasks`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
                onClick={() => setMenuOpen(false)}
              >
                <ExternalLink className="h-4 w-4" /> Ouvrir projet
              </Link>
            )}
            {task.clientId && (
              <Link
                href={`/clients/${task.clientId}`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
                onClick={() => setMenuOpen(false)}
              >
                <ExternalLink className="h-4 w-4" /> Ouvrir client
              </Link>
            )}
            <MenuBtn
              onClick={() => {
                duplicateTask.mutate(task);
                setMenuOpen(false);
              }}
            >
              <Copy className="h-4 w-4" /> Dupliquer
            </MenuBtn>
            <MenuBtn danger onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Supprimer
            </MenuBtn>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuBtn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm",
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
      )}
    >
      {children}
    </button>
  );
}
