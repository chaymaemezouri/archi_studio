"use client";

import Link from "next/link";
import { useState } from "react";
import { isToday, isTomorrow } from "date-fns";
import {
  ArrowUpRight,
  CalendarClock,
  Check,
  Clock3,
  ListTodo,
} from "lucide-react";
import type { Deadline, Priority, Task } from "@/types";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { accentBar } from "@/lib/glass-styles";

export interface DailyFlowAgendaItem {
  id: string;
  title: string;
  meta: string;
  href: string;
}

interface DailyFlowPanelProps {
  tasks: Task[];
  deadlines: Deadline[];
  agenda: DailyFlowAgendaItem[];
  onCompleteTask: (taskId: string) => void;
  isCompletingTask?: boolean;
  className?: string;
}

const flowBlockShell = cn(
  "rounded-lg border border-white/[0.07] bg-white/[0.025]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
);

const flowItemRow = cn(
  "group/row relative flex items-center gap-2 rounded-lg px-2 py-1.5",
  "transition duration-200 hover:bg-white/[0.04]"
);

function FlowCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-studio-light/18 bg-studio-light/[0.08] px-1 text-[9px] font-semibold tabular-nums text-studio-light/85">
      {count}
    </span>
  );
}

function FlowBlock({
  icon: Icon,
  label,
  count,
  href,
  linkLabel,
  children,
  empty,
}: {
  icon: typeof ListTodo;
  label: string;
  count: number;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <section className={flowBlockShell}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md border border-studio-light/12 bg-studio-light/[0.06]">
            <Icon className="h-3 w-3 text-studio-light/75" strokeWidth={1.75} />
          </span>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
            {label}
          </h3>
          <FlowCountBadge count={count} />
        </div>
        {href && linkLabel && (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-white/38 transition hover:text-studio-light/85"
          >
            {linkLabel}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="p-1.5">{children}</div>
    </section>
  );
}

function priorityAccentClass(priority: Priority): string | null {
  if (priority === "URGENT") return "before:bg-red-400/75";
  if (priority === "HIGH") return "before:bg-studio-light/65";
  return null;
}

function PriorityChip({ priority }: { priority: Priority }) {
  if (priority !== "URGENT" && priority !== "HIGH") return null;
  return (
    <span
      className={cn(
        "shrink-0 rounded border px-1.5 py-px text-[9px] font-medium leading-none",
        priority === "URGENT"
          ? "border-red-400/20 bg-red-500/10 text-red-300/85"
          : "border-studio-light/20 bg-studio-light/10 text-studio-light/80"
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

function formatFlowDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Aujourd'hui";
  if (isTomorrow(date)) return "Demain";
  return formatDate(dateStr, "EEE dd MMM");
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 py-2.5 text-center text-[11px] leading-relaxed text-white/38">{children}</p>
  );
}

function TaskCheckbox({
  checked,
  disabled,
  onToggle,
}: {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "mt-0.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border transition duration-200",
        checked
          ? "border-emerald-500/45 bg-emerald-500/15"
          : "border-white/30 bg-white/[0.02] hover:border-studio-light/45 hover:bg-studio-light/10",
        "disabled:opacity-40"
      )}
      title={checked ? "Terminée" : "Marquer terminée"}
      aria-label={checked ? "Tâche terminée" : "Marquer terminée"}
      aria-pressed={checked}
    >
      {checked && <Check className="h-2.5 w-2.5 text-emerald-400" strokeWidth={3} />}
    </button>
  );
}

export default function DailyFlowPanel({
  tasks,
  deadlines,
  agenda,
  onCompleteTask,
  isCompletingTask,
  className,
}: DailyFlowPanelProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set());

  const handleCompleteTask = (taskId: string) => {
    setCheckedIds((prev) => new Set(prev).add(taskId));
    onCompleteTask(taskId);
  };

  return (
    <aside className={cn("space-y-2.5 p-3.5", className)}>
      <FlowBlock
        icon={Clock3}
        label="Agenda"
        count={agenda.length}
        href="/calendar"
        linkLabel="Calendrier"
        empty={agenda.length === 0}
      >
        {agenda.length === 0 ? (
          <EmptyHint>Journée libre.</EmptyHint>
        ) : (
          <ul className="space-y-0.5">
            {agenda.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={cn(flowItemRow, "justify-between")}>
                  <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-white/90">
                    {item.title}
                  </p>
                  <span className="ml-2 shrink-0 rounded-md border border-studio-light/15 bg-studio-light/[0.08] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-studio-light/85">
                    {item.meta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </FlowBlock>

      <FlowBlock
        icon={ListTodo}
        label="Tâches"
        count={tasks.length}
        href="/tasks"
        linkLabel="Tout"
        empty={tasks.length === 0}
      >
        {tasks.length === 0 ? (
          <EmptyHint>Rien à traiter pour l&apos;instant.</EmptyHint>
        ) : (
          <ul className="space-y-0.5">
            {tasks.map((task) => {
              const accent = priorityAccentClass(task.priority);
              const href = task.projectId ? `/projects/${task.projectId}?tab=tasks` : "/tasks";

              return (
                <li
                  key={task.id}
                  className={cn(
                    flowItemRow,
                    accent &&
                      "before:absolute before:bottom-2 before:left-0 before:top-2 before:w-0.5 before:rounded-full before:content-['']",
                    accent
                  )}
                >
                  <TaskCheckbox
                    checked={task.status === "DONE" || checkedIds.has(task.id)}
                    disabled={isCompletingTask || checkedIds.has(task.id)}
                    onToggle={() => handleCompleteTask(task.id)}
                  />
                  <Link href={href} className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-[13px] font-medium leading-snug text-white/88 transition group-hover/row:text-white",
                        checkedIds.has(task.id) && "text-white/45 line-through"
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-white/35">
                        {task.dueDate
                          ? formatFlowDate(task.dueDate)
                          : TASK_STATUS_LABELS[task.status]}
                      </span>
                      <PriorityChip priority={task.priority} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </FlowBlock>

      <FlowBlock
        icon={CalendarClock}
        label="Deadlines"
        count={deadlines.length}
        href="/calendar"
        linkLabel="Calendrier"
        empty={deadlines.length === 0}
      >
        {deadlines.length === 0 ? (
          <EmptyHint>Aucune échéance proche.</EmptyHint>
        ) : (
          <ul className="space-y-0.5">
            {deadlines.map((deadline) => {
              const urgent = deadline.priority === "URGENT" || deadline.priority === "HIGH";

              return (
                <li key={deadline.id} className={flowItemRow}>
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      urgent ? "bg-studio-light/80 shadow-[0_0_6px_rgba(139,164,199,0.45)]" : "bg-white/25"
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-white/88">{deadline.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] capitalize text-white/38">
                      <CalendarClock
                        className="h-3 w-3 shrink-0 text-studio-light/55"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      {formatFlowDate(deadline.date)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </FlowBlock>
    </aside>
  );
}

export function DailyFlowPanelHeader({
  href,
  linkLabel = "Agenda",
}: {
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
      <h2 className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-white/90">
        <span className={cn(accentBar, "h-3.5")} aria-hidden />
        Flux du jour
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-[12px] font-medium text-white/45 transition hover:text-studio-light"
        >
          {linkLabel}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
