"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, ClipboardList, Filter, Plus } from "lucide-react";
import DashboardCard from "./DashboardCard";
import { useCreateDashboardTask, useUpdateDashboardTask } from "@/hooks/useDashboard";
import { toLocalDateInput } from "@/lib/dates";
import type { Priority, Project, Task } from "@/types";
import { cn } from "@/lib/utils";
import Tooltip from "@/components/ui/Tooltip";
import {
  dashboardCardTitle,
  dashboardEmptyCompact,
  dashboardEmptyIconSm,
  dashboardIconBtn,
  dashboardIconBtnAccent,
} from "./dashboard-ui";

interface DayTasksPanelProps {
  title: string;
  tasks?: Task[];
  projects?: Project[];
  defaultDate: Date;
  compact?: boolean;
}

type FilterMode = "all" | "open" | Priority;

export default function DayTasksPanel({
  title,
  tasks = [],
  projects = [],
  defaultDate,
  compact = false,
}: DayTasksPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [filterOpen, setFilterOpen] = useState(false);
  const [hideDone, setHideDone] = useState(true);
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterPriority, setFilterPriority] = useState<FilterMode>("all");

  const createTask = useCreateDashboardTask();
  const updateTask = useUpdateDashboardTask();

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (hideDone && t.status === "DONE") return false;
      if (filterProjectId && t.projectId !== filterProjectId) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, hideDone, filterProjectId, filterPriority]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    const dateStr = toLocalDateInput(defaultDate);
    await createTask.mutateAsync({
      title: titleInput.trim(),
      dueDate: dateStr,
      scheduledAt: dateStr,
      projectId: projectId || undefined,
      priority,
    });
    setTitleInput("");
    setProjectId("");
    setShowForm(false);
  };

  const toggleTask = (task: Task) => {
    updateTask.mutate({
      id: task.id,
      status: task.status === "DONE" ? "TODO" : "DONE",
    });
  };

  const isTomorrow = title.toLowerCase().includes("demain");

  return (
    <DashboardCard className={cn(compact && "!p-3.5", filtered.length === 0 && "!min-h-0")}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className={dashboardCardTitle}>{title}</h2>
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <Tooltip label="Filtrer les tâches">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={cn(
                  dashboardIconBtn,
                  filterOpen || filterProjectId || filterPriority !== "all" || !hideDone
                    ? "!bg-orange-50 !text-[#B85C15]"
                    : ""
                )}
                aria-label="Filtrer les tâches"
              >
                <Filter className="h-4 w-4" />
              </button>
            </Tooltip>
            {filterOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-stone-200/80 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                <label className="flex items-center gap-2 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={hideDone}
                    onChange={(e) => setHideDone(e.target.checked)}
                  />
                  Masquer terminées
                </label>
                <select
                  value={filterProjectId}
                  onChange={(e) => setFilterProjectId(e.target.value)}
                  className="mt-2 w-full rounded border border-stone-200 px-2 py-1 text-xs"
                >
                  <option value="">Tous les projets</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as FilterMode)}
                  className="mt-2 w-full rounded border border-stone-200 px-2 py-1 text-xs"
                >
                  <option value="all">Toutes priorités</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">Haute</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="LOW">Basse</option>
                </select>
              </div>
            )}
          </div>
          <Tooltip label="Ajouter une tâche">
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className={dashboardIconBtnAccent}
              aria-label="Ajouter une tâche"
            >
              <Plus className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-3 space-y-2 rounded-xl border border-stone-200/80 bg-stone-50/80 p-3"
        >
          <input
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Titre de la tâche"
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
            autoFocus
          />
          {projects.length > 0 && (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm"
            >
              <option value="">Sans projet</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm"
          >
            <option value="LOW">Basse</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HIGH">Haute</option>
            <option value="URGENT">Urgent</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createTask.isPending}
              className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-stone-600"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className={dashboardEmptyCompact}>
          <div className={dashboardEmptyIconSm}>
            <ClipboardList className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <p className="text-[11px] font-medium text-stone-600">
            {isTomorrow
              ? "Aucune tâche prévue demain"
              : "Aucune tâche prévue aujourd\u2019hui"}
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-1 text-[10px] font-medium text-[#B85C15] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Ajouter une tâche
          </button>
        </div>
      ) : (
        <ul className={cn("space-y-1", compact && "max-h-44 overflow-y-auto pr-0.5")}>
          {filtered.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-2 rounded-xl px-2 py-2 transition hover:bg-stone-50/80"
            >
              <button type="button" onClick={() => toggleTask(task)} className="mt-0.5 shrink-0">
                {task.status === "DONE" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-stone-300" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-xs font-medium text-stone-800",
                    task.status === "DONE" && "font-normal text-stone-400 line-through"
                  )}
                >
                  {task.title}
                </p>
                <p className="text-[10px] text-stone-400">
                  {task.project?.name}
                  {task.project?.name && " · "}
                  {task.priority}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
