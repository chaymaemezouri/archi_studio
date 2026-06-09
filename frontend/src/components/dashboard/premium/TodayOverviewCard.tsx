"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, Circle, Plus, Users } from "lucide-react";
import DashboardCard from "../DashboardCard";
import {
  useCreateDashboardTask,
  useUpdateDashboardTask,
  useUpdateDeadline,
} from "@/hooks/useDashboard";
import { toLocalDateInput } from "@/lib/dates";
import type { Deadline, Meeting, Task } from "@/types";
import { formatDate } from "@/lib/utils";

interface TodayOverviewCardProps {
  tasks?: Task[];
  meetings?: Meeting[];
  urgentDeadline?: Deadline | null;
}

export default function TodayOverviewCard({
  tasks = [],
  meetings = [],
  urgentDeadline,
}: TodayOverviewCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const createTask = useCreateDashboardTask();
  const updateTask = useUpdateDashboardTask();
  const updateDeadline = useUpdateDeadline();

  const openTasks = tasks.filter((t) => t.status !== "DONE");
  const isEmpty = openTasks.length === 0 && meetings.length === 0 && !urgentDeadline;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    const dateStr = toLocalDateInput(new Date());
    await createTask.mutateAsync({
      title: titleInput.trim(),
      dueDate: dateStr,
      scheduledAt: dateStr,
    });
    setTitleInput("");
    setShowForm(false);
  };

  return (
    <DashboardCard variant="glass" className="h-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Aujourd&apos;hui</h2>
          <p className="text-xs text-slate-500">Vos actions prioritaires du jour</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-white/80 hover:text-slate-900"
          aria-label="Ajouter une tâche"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {urgentDeadline && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-orange-200/80 bg-orange-50/60 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <CalendarClock className="h-4 w-4 shrink-0 text-orange-600" />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-orange-700">
                Deadline urgente
              </p>
              <p className="truncate text-sm font-medium text-slate-900">{urgentDeadline.title}</p>
              <p className="text-xs text-slate-500">
                {urgentDeadline.project?.name && `${urgentDeadline.project.name} · `}
                {formatDate(urgentDeadline.date)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateDeadline.mutate({ id: urgentDeadline.id, done: true })}
            className="shrink-0 text-xs font-medium text-orange-700 hover:underline"
          >
            Fait
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Nouvelle tâche…"
            className="min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={createTask.isPending}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white"
          >
            OK
          </button>
        </form>
      )}

      {meetings.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Réunions
          </p>
          <ul className="space-y-1.5">
            {meetings.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-2 rounded-xl bg-sky-50/70 px-3 py-2 text-sm text-slate-800"
              >
                <Users className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                {m.startTime && (
                  <span className="font-mono text-xs text-slate-500">{m.startTime}</span>
                )}
                <span className="truncate">{m.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {openTasks.length > 0 && (
        <div className="mb-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Tâches
          </p>
          <ul className="space-y-1">
            {openTasks.map((task) => (
              <li key={task.id} className="flex items-start gap-2 rounded-xl px-1 py-1.5">
                <button
                  type="button"
                  onClick={() =>
                    updateTask.mutate({
                      id: task.id,
                      status: task.status === "DONE" ? "TODO" : "DONE",
                    })
                  }
                  className="mt-0.5 shrink-0"
                >
                  {task.status === "DONE" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">{task.title}</p>
                  {task.project?.name && (
                    <p className="text-xs text-slate-400">{task.project.name}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isEmpty && (
        <p className="py-6 text-center text-sm text-slate-400">
          Aucune tâche prévue aujourd&apos;hui.
        </p>
      )}

    </DashboardCard>
  );
}
