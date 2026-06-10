import type { Priority, TaskStatus } from "@/types";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import { dashboardTaskChip } from "@/components/dashboard/dashboard-ui";
import { cn } from "@/lib/utils";

interface DashboardTaskMetaProps {
  status: TaskStatus;
  priority: Priority;
  projectName?: string | null;
  className?: string;
}

const STATUS_CHIP: Record<TaskStatus, string> = {
  TODO: cn(
    dashboardTaskChip,
    "bg-[color:var(--glass-bg-hover)] text-glass-muted"
  ),
  IN_PROGRESS: cn(
    dashboardTaskChip,
    "bg-[color:var(--badge-studio-bg)] text-[color:var(--badge-studio-text)]"
  ),
  DONE: cn(
    dashboardTaskChip,
    "bg-[color:var(--badge-success-bg)] text-[color:var(--badge-success-text)]"
  ),
  CANCELLED: cn(
    dashboardTaskChip,
    "bg-[color:var(--glass-bg-hover)] text-glass-muted/70 line-through"
  ),
};

const PRIORITY_CHIP: Partial<Record<Priority, string>> = {
  URGENT: cn(
    dashboardTaskChip,
    "bg-[color:var(--badge-danger-bg)] text-[color:var(--badge-danger-text)]"
  ),
  HIGH: cn(
    dashboardTaskChip,
    "bg-[color:var(--badge-warning-bg)] text-[color:var(--badge-warning-text)]"
  ),
};

const projectChip = cn(
  dashboardTaskChip,
  "max-w-[9.5rem] truncate bg-[color:var(--glass-bg)]/90 text-glass-muted"
);

/** Méta tâche — mini pastilles douces */
export default function DashboardTaskMeta({
  status,
  priority,
  projectName,
  className,
}: DashboardTaskMetaProps) {
  const showPriority = priority === "URGENT" || priority === "HIGH";

  return (
    <div
      className={cn(
        "mt-1 flex min-w-0 flex-wrap items-center gap-1",
        className
      )}
    >
      <span className={STATUS_CHIP[status]}>{TASK_STATUS_LABELS[status]}</span>

      {showPriority && (
        <span className={PRIORITY_CHIP[priority]}>
          {PRIORITY_LABELS[priority]}
        </span>
      )}

      {projectName?.trim() && (
        <span className={projectChip} title={projectName.trim()}>
          {projectName.trim()}
        </span>
      )}
    </div>
  );
}
