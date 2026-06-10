"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, Trash2 } from "lucide-react";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import { detailIconActionGroup } from "@/components/projects/detail/project-detail-ui";
import Badge from "@/components/ui/Badge";
import { useDialog } from "@/components/providers/DialogProvider";
import { useDeleteDeadline, useUpdateDeadline } from "@/hooks/useDeadlines";
import {
  getDeadlineStatusLabel,
  isDeadlineOverdue,
} from "@/lib/deadlines-list";
import type { Deadline } from "@/types";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/types";
import {
  deadlinesListHeader,
  deadlinesListRow,
} from "./deadlines-list-ui";
import { cn, formatDate } from "@/lib/utils";

interface DeadlineRowProps {
  deadline: Deadline;
}

export function DeadlineListHeader() {
  return (
    <div className={deadlinesListHeader}>
      <span>Titre</span>
      <span>Date</span>
      <span>Priorité</span>
      <span>Statut</span>
      <span />
    </div>
  );
}

export default function DeadlineRow({ deadline }: DeadlineRowProps) {
  const { confirm } = useDialog();
  const updateDeadline = useUpdateDeadline();
  const deleteDeadline = useDeleteDeadline();

  const handleComplete = () => {
    updateDeadline.mutate({ id: deadline.id, done: !deadline.done });
  };

  const handleDelete = async () => {
    if (
      !(await confirm({
        title: "Supprimer la deadline",
        message: `Supprimer « ${deadline.title} » ?`,
        confirmLabel: "Supprimer",
        variant: "danger",
      }))
    ) {
      return;
    }
    deleteDeadline.mutate(deadline.id);
  };

  const statusLabel = getDeadlineStatusLabel(deadline);
  const overdue = isDeadlineOverdue(deadline);
  const projectId = deadline.projectId ?? deadline.project?.id;

  return (
    <div className={cn(deadlinesListRow, deadline.done && "opacity-65")}>
      <div className="min-w-0">
        <p
          className={cn(
            "font-medium text-glass",
            deadline.done && "line-through"
          )}
        >
          {deadline.title}
        </p>
        {projectId && deadline.project?.name && (
          <p className="mt-0.5 truncate text-[11px] text-glass-muted md:hidden">
            {deadline.project.name}
          </p>
        )}
      </div>

      <span className="text-glass-secondary">
        <span className="text-[10px] text-glass-muted md:hidden">Date · </span>
        {formatDate(deadline.date)}
      </span>

      <span>
        <Badge className={PRIORITY_COLORS[deadline.priority]}>
          {PRIORITY_LABELS[deadline.priority]}
        </Badge>
      </span>

      <span>
        <Badge
          variant={
            deadline.done ? "success" : overdue ? "danger" : "studio"
          }
        >
          {statusLabel}
        </Badge>
      </span>

      <div
        className={cn(detailIconActionGroup, "justify-self-end")}
        role="group"
        aria-label="Actions deadline"
      >
        {!deadline.done && (
          <IconActionButton
            label="Terminer"
            icon={CheckCircle2}
            tone="success"
            disabled={updateDeadline.isPending}
            onClick={handleComplete}
          />
        )}
        {deadline.done && (
          <IconActionButton
            label="Rouvrir"
            icon={CheckCircle2}
            tone="default"
            disabled={updateDeadline.isPending}
            onClick={handleComplete}
          />
        )}
        {projectId && (
          <IconActionButton
            label="Ouvrir projet"
            icon={ExternalLink}
            tone="view"
            href={`/projects/${projectId}`}
          />
        )}
        <IconActionButton
          label="Supprimer"
          icon={Trash2}
          tone="danger"
          disabled={deleteDeadline.isPending}
          onClick={() => void handleDelete()}
        />
      </div>
    </div>
  );
}
