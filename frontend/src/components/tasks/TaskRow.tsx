"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  MoreVertical,
  Pencil,
  PlayCircle,
  Trash2,
} from "lucide-react";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import { detailIconActionGroup } from "@/components/projects/detail/project-detail-ui";
import Badge from "@/components/ui/Badge";
import { useDialog } from "@/components/providers/DialogProvider";
import { portalMenuStyle, usePortalRowMenu } from "@/hooks/usePortalRowMenu";
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

const MENU_WIDTH = 192;
const MENU_HEIGHT = 280;

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
  const { confirm } = useDialog();
  const { ref, menuRef, menuOpen, menuPos, closeMenu, toggleMenu } = usePortalRowMenu(
    MENU_WIDTH,
    MENU_HEIGHT
  );
  const completeTask = useCompleteTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const duplicateTask = useDuplicateTask();

  const deadlineBadge = getTaskDeadlineBadge(task);
  const closed = isTaskClosed(task.status);
  const projectName = task.projectName ?? task.project?.name;
  const clientName = task.clientName ?? task.project?.client?.name;

  const handleComplete = () => {
    completeTask.mutate(task.id);
    closeMenu();
  };

  const handleDelete = async () => {
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
    closeMenu();
  };

  const canComplete = task.status !== "DONE" && task.status !== "CANCELLED";

  const menuPanel =
    menuOpen && menuPos ? (
      <div
        ref={menuRef}
        role="menu"
        className={cn(glassMenu, "fixed z-[200] w-48 py-1")}
        style={portalMenuStyle(menuPos)}
      >
        <MenuBtn onClick={() => { onEdit(task); closeMenu(); }}>
          <Pencil className="h-4 w-4" /> Modifier
        </MenuBtn>
        {task.status !== "IN_PROGRESS" && task.status !== "DONE" && (
          <MenuBtn
            onClick={() => {
              updateStatus.mutate({ id: task.id, status: "IN_PROGRESS" });
              closeMenu();
            }}
          >
            <PlayCircle className="h-4 w-4" /> En cours
          </MenuBtn>
        )}
        {canComplete && (
          <MenuBtn onClick={handleComplete}>
            <CheckCircle2 className="h-4 w-4" /> Terminer
          </MenuBtn>
        )}
        {task.projectId && (
          <Link
            href={`/projects/${task.projectId}?tab=tasks`}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
            onClick={closeMenu}
          >
            <ExternalLink className="h-4 w-4" /> Ouvrir projet
          </Link>
        )}
        {task.clientId && (
          <Link
            href={`/clients/${task.clientId}`}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-glass-muted hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
            onClick={closeMenu}
          >
            <ExternalLink className="h-4 w-4" /> Ouvrir client
          </Link>
        )}
        <MenuBtn
          onClick={() => {
            duplicateTask.mutate(task);
            closeMenu();
          }}
        >
          <Copy className="h-4 w-4" /> Dupliquer
        </MenuBtn>
        <MenuBtn danger onClick={() => void handleDelete()}>
          <Trash2 className="h-4 w-4" /> Supprimer
        </MenuBtn>
      </div>
    ) : null;

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
          <p className="mt-0.5 line-clamp-1 text-[11px] text-glass-muted">
            {task.description}
          </p>
        )}
        {deadlineBadge !== "none" && (
          <Badge variant={taskDeadlineBadgeVariant(deadlineBadge)} className="mt-1">
            {TASK_DEADLINE_BADGE_LABELS[deadlineBadge]}
          </Badge>
        )}
      </div>

      <span className="min-w-0 text-glass-secondary">
        <span className="text-[10px] text-glass-muted md:hidden">Projet · </span>
        {task.projectId && projectName ? (
          <Link href={`/projects/${task.projectId}?tab=tasks`} className={tasksListLink}>
            {projectName}
          </Link>
        ) : (
          "Personnelle"
        )}
      </span>

      <span className="min-w-0 text-glass-secondary">
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

      <div
        ref={ref}
        className={cn(detailIconActionGroup, "relative z-10 justify-self-end")}
        role="group"
        aria-label="Actions tâche"
      >
        {canComplete && (
          <IconActionButton
            label="Terminer"
            icon={CheckCircle2}
            tone="success"
            disabled={completeTask.isPending}
            onClick={handleComplete}
          />
        )}
        <IconActionButton
          label="Supprimer"
          icon={Trash2}
          tone="danger"
          disabled={deleteTask.isPending}
          onClick={() => void handleDelete()}
        />
        <button
          type="button"
          onClick={toggleMenu}
          className={cn(
            glassBtnIcon,
            "h-7 w-7 shrink-0 border-0 bg-transparent text-glass-muted shadow-none",
            "hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
          )}
          aria-label="Plus d'actions"
          aria-expanded={menuOpen}
        >
          <MoreVertical className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        {typeof document !== "undefined" && menuPanel ? createPortal(menuPanel, document.body) : null}
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
