"use client";

import Link from "next/link";
import { useState } from "react";
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

export interface DashboardAgendaItem {
  id: string;
  title: string;
  meta: string;
  href: string;
}

interface DashboardTodayPanelProps {
  agenda: DashboardAgendaItem[];
  tasks: Task[];
  deadlines: Deadline[];
  onCompleteTask: (taskId: string) => void;
  isCompletingTask?: boolean;
  className?: string;
}

const panelShell = cn(
  "rounded-xl border border-white/[0.08] bg-white/[0.035]",
  "shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl"
);

const row = "flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-white/[0.04]";

function TodaySection({
  icon: Icon,
  label,
  href,
  linkLabel,
  children,
}: {
  icon: typeof Clock3;
  label: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/[0.05] last:border-0">
      <div className="flex items-center justify-between px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-studio-light/65" strokeWidth={1.75} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
            {label}
          </span>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-white/35 transition hover:text-studio-light/80"
        >
          {linkLabel}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="max-h-none space-y-0.5 overflow-visible px-1.5 pb-2 sm:max-h-36 sm:overflow-y-auto">
        {children}
      </div>
    </div>
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
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition sm:h-[14px] sm:w-[14px] sm:rounded-[3px]",
        checked
          ? "border-emerald-500/45 bg-emerald-500/15"
          : "border-white/28 bg-white/[0.02] hover:border-studio-light/40",
        "disabled:opacity-40"
      )}
      aria-label={checked ? "Tâche terminée" : "Marquer terminée"}
    >
      {checked && <Check className="h-2.5 w-2.5 text-emerald-400" strokeWidth={3} />}
    </button>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="px-2 py-1 text-[11px] text-white/35">{children}</p>;
}

export default function DashboardTodayPanel({
  agenda,
  tasks,
  deadlines,
  onCompleteTask,
  isCompletingTask,
  className,
}: DashboardTodayPanelProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set());

  const handleComplete = (taskId: string) => {
    setCheckedIds((prev) => new Set(prev).add(taskId));
    onCompleteTask(taskId);
  };

  return (
    <section className={cn(panelShell, className)}>
      <div className="border-b border-white/[0.06] px-3.5 py-2.5">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-white/90">
          <span className={cn(accentBar, "h-3 opacity-80")} aria-hidden />
          Aujourd&apos;hui
        </h2>
      </div>

      <TodaySection icon={Clock3} label="Agenda du jour" href="/calendar" linkLabel="Voir tout">
        {agenda.length === 0 ? (
          <EmptyLine>Journée libre.</EmptyLine>
        ) : (
          agenda.map((item) => (
            <Link key={item.id} href={item.href} className={cn(row, "justify-between")}>
              <span className="min-w-0 truncate text-[12px] text-white/85">{item.title}</span>
              <span className="shrink-0 rounded border border-studio-light/15 bg-studio-light/[0.07] px-1.5 py-px text-[10px] tabular-nums text-studio-light/80">
                {item.meta}
              </span>
            </Link>
          ))
        )}
      </TodaySection>

      <TodaySection icon={ListTodo} label="Tâches du jour" href="/tasks" linkLabel="Voir tout">
        {tasks.length === 0 ? (
          <EmptyLine>Aucune tâche pour aujourd&apos;hui.</EmptyLine>
        ) : (
          tasks.map((task) => {
            const href = task.projectId ? `/projects/${task.projectId}?tab=tasks` : "/tasks";
            const checked = task.status === "DONE" || checkedIds.has(task.id);
            return (
              <div key={task.id} className={row}>
                <TaskCheckbox
                  checked={checked}
                  disabled={isCompletingTask || checkedIds.has(task.id)}
                  onToggle={() => handleComplete(task.id)}
                />
                <Link href={href} className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-[12px] text-white/85",
                      checked && "text-white/40 line-through"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-[10px] text-white/35">
                    {TASK_STATUS_LABELS[task.status]}
                    {(task.priority === "URGENT" || task.priority === "HIGH") &&
                      ` · ${PRIORITY_LABELS[task.priority as Priority]}`}
                  </p>
                </Link>
              </div>
            );
          })
        )}
      </TodaySection>

      <TodaySection icon={CalendarClock} label="Deadlines du jour" href="/calendar" linkLabel="Voir tout">
        {deadlines.length === 0 ? (
          <EmptyLine>Aucune deadline aujourd&apos;hui.</EmptyLine>
        ) : (
          deadlines.map((deadline) => (
            <div key={deadline.id} className={row}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-studio-light/70" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] text-white/85">{deadline.title}</p>
                <p className="text-[10px] text-white/38">
                  {formatDate(deadline.date, "HH:mm")}
                </p>
              </div>
            </div>
          ))
        )}
      </TodaySection>
    </section>
  );
}
