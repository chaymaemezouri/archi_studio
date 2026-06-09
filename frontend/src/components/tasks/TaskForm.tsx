"use client";

import { useEffect, useState } from "react";
import {
  financeFieldClass,
  financeSelectClass,
  FinanceFieldLabel,
  FinanceFormSection,
} from "@/components/finances/finance-form-ui";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { glassBtnPrimary } from "@/lib/glass-styles";
import type { Priority, Task, TaskStatus } from "@/types";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export type TaskFormValues = {
  title: string;
  description: string;
  projectId: string;
  clientId: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  notes: string;
};

export function emptyTaskForm(): TaskFormValues {
  return {
    title: "",
    description: "",
    projectId: "",
    clientId: "",
    dueDate: "",
    priority: "MEDIUM",
    status: "TODO",
    notes: "",
  };
}

export function taskToForm(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? "",
    projectId: task.projectId ?? "",
    clientId: task.clientId ?? "",
    dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    priority: task.priority,
    status: task.status,
    notes: task.notes ?? "",
  };
}

export function validateTaskForm(values: TaskFormValues): string | null {
  if (!values.title.trim()) return "Le titre est obligatoire.";
  if (values.dueDate) {
    const d = new Date(values.dueDate);
    if (Number.isNaN(d.getTime())) return "Deadline invalide.";
  }
  return null;
}

interface TaskFormProps {
  initial?: Task | null;
  defaultProjectId?: string;
  onSubmit: (payload: Partial<Task>) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function TaskForm({
  initial,
  defaultProjectId,
  onSubmit,
  loading,
  submitLabel = "Enregistrer",
}: TaskFormProps) {
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const [values, setValues] = useState<TaskFormValues>(() => {
    if (initial) return taskToForm(initial);
    const form = emptyTaskForm();
    if (defaultProjectId) form.projectId = defaultProjectId;
    return form;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setValues(taskToForm(initial));
    } else {
      const form = emptyTaskForm();
      if (defaultProjectId) form.projectId = defaultProjectId;
      setValues(form);
    }
  }, [initial, defaultProjectId]);

  const set = <K extends keyof TaskFormValues>(key: K, val: TaskFormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "projectId" && val) {
        const project = projects.find((p) => p.id === val);
        if (project?.clientId) next.clientId = project.clientId;
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateTaskForm(values);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      projectId: values.projectId || undefined,
      clientId: values.clientId || undefined,
      dueDate: values.dueDate || undefined,
      priority: values.priority,
      status: values.status,
      notes: values.notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/[0.08] px-3 py-2 text-[12px] text-rose-200/90">
          {error}
        </p>
      )}

      <FinanceFormSection title="Tâche">
        <div>
          <FinanceFieldLabel required>Titre</FinanceFieldLabel>
          <input
            className={financeFieldClass}
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </div>
        <div>
          <FinanceFieldLabel>Description</FinanceFieldLabel>
          <textarea
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className={cn(financeFieldClass, "min-h-[72px] resize-y")}
          />
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Lien">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FinanceFieldLabel>Projet lié</FinanceFieldLabel>
            <select
              className={cn(financeSelectClass, !values.projectId && "text-glass-muted")}
              value={values.projectId}
              onChange={(e) => set("projectId", e.target.value)}
            >
              <option value="" className="bg-[#101014]">
                Personnelle / sans projet
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#101014]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FinanceFieldLabel>Client lié</FinanceFieldLabel>
            <select
              className={cn(financeSelectClass, !values.clientId && "text-glass-muted")}
              value={values.clientId}
              onChange={(e) => set("clientId", e.target.value)}
            >
              <option value="" className="bg-[#101014]">
                Aucun
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#101014]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Planning">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <FinanceFieldLabel>Deadline</FinanceFieldLabel>
            <input
              type="date"
              className={financeFieldClass}
              value={values.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </div>
          <div>
            <FinanceFieldLabel>Priorité</FinanceFieldLabel>
            <select
              className={financeSelectClass}
              value={values.priority}
              onChange={(e) => set("priority", e.target.value as Priority)}
            >
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-[#101014]">
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FinanceFieldLabel>Statut</FinanceFieldLabel>
            <select
              className={financeSelectClass}
              value={values.status}
              onChange={(e) => set("status", e.target.value as TaskStatus)}
            >
              {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-[#101014]">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Notes">
        <textarea
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          className={cn(financeFieldClass, "min-h-[72px] resize-y")}
          placeholder="Notes internes…"
        />
      </FinanceFormSection>

      <div className="flex justify-end border-t border-app pt-4">
        <button
          type="submit"
          disabled={loading || !values.title.trim()}
          className={cn(glassBtnPrimary, "w-full sm:w-auto")}
        >
          {loading ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
