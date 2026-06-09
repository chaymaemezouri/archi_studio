"use client";

import { useState } from "react";
import { Circle, Plus } from "lucide-react";
import DashboardCard from "./DashboardCard";
import { useCreateDashboardTask, useUpdateDashboardTask } from "@/hooks/useDashboard";
import { toLocalDateInput } from "@/lib/dates";
import type { Project, Task } from "@/types";
import { cn } from "@/lib/utils";

interface CompactTasksPanelProps {
  todayTasks?: Task[];
  tomorrowTasks?: Task[];
  projects?: Project[];
  today: Date;
  tomorrow: Date;
}

export default function CompactTasksPanel({
  todayTasks = [],
  tomorrowTasks = [],
  today,
  tomorrow,
}: CompactTasksPanelProps) {
  const [tab, setTab] = useState<"today" | "tomorrow">("today");
  const [showForm, setShowForm] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const createTask = useCreateDashboardTask();
  const updateTask = useUpdateDashboardTask();

  const tasks = tab === "today" ? todayTasks : tomorrowTasks;
  const date = tab === "today" ? today : tomorrow;
  const open = tasks.filter((t) => t.status !== "DONE");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    const dateStr = toLocalDateInput(date);
    await createTask.mutateAsync({
      title: titleInput.trim(),
      dueDate: dateStr,
      scheduledAt: dateStr,
    });
    setTitleInput("");
    setShowForm(false);
  };

  return (
    <DashboardCard className="!p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex rounded-lg bg-stone-100 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setTab("today")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium",
              tab === "today" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
            )}
          >
            Aujourd&apos;hui
            {tab === "today" && open.length > 0 ? ` (${open.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setTab("tomorrow")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium",
              tab === "tomorrow" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
            )}
          >
            Demain
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-md p-1 text-[#E07820] hover:bg-orange-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-2 flex gap-1">
          <input
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Nouvelle tâche"
            className="min-w-0 flex-1 rounded-md border border-stone-200 px-2 py-1 text-xs"
            autoFocus
          />
          <button type="submit" className="rounded-md bg-[#E07820] px-2 text-xs text-white">
            OK
          </button>
        </form>
      )}

      {open.length === 0 ? (
        <p className="py-4 text-center text-xs text-stone-400">Aucune tâche</p>
      ) : (
        <ul className="max-h-36 space-y-1 overflow-y-auto">
          {open.slice(0, 6).map((task) => (
            <li key={task.id} className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-stone-50">
              <button type="button" onClick={() => updateTask.mutate({ id: task.id, status: "DONE" })}>
                <Circle className="h-3.5 w-3.5 text-stone-300" />
              </button>
              <span className="truncate text-xs text-stone-700">{task.title}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
