"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toLocalDateInput } from "@/lib/dates";
import {
  glassBtnPrimary,
  glassBtnSecondary,
  filterChipActive,
  filterChipInactive,
  glassPanel,
} from "@/lib/glass-styles";
import { modalOverlay } from "@/lib/theme-classes";
import {
  useCreateDashboardTask,
  useCreateDeadline,
  useCreateMeeting,
} from "@/hooks/useDashboard";
import type { Priority, Project } from "@/types";
import { PRIORITY_LABELS } from "@/types";
import {
  quickAddFieldLabel,
  quickAddInput,
  quickAddSelect,
  quickAddTextarea,
} from "./quick-add-ui";

export type QuickAddMode = "deadline" | "meeting" | "task";

const MODES: { id: QuickAddMode; label: string }[] = [
  { id: "deadline", label: "Deadline" },
  { id: "task", label: "Tâche" },
  { id: "meeting", label: "Réunion" },
];

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate: Date;
  defaultProjectId?: string;
  projects?: Project[];
  initialMode?: QuickAddMode;
}

function QuickAddField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className={quickAddFieldLabel}>{label}</span>
      {children}
    </div>
  );
}

function PriorityChips({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (p: Priority) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRIORITIES.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "rounded-lg px-2.5 py-1 text-[11px] font-medium transition",
            value === p ? filterChipActive : filterChipInactive
          )}
        >
          {PRIORITY_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

export default function QuickAddModal({
  open,
  onClose,
  defaultDate,
  defaultProjectId,
  projects = [],
  initialMode = "deadline",
}: QuickAddModalProps) {
  const [type, setType] = useState<QuickAddMode>(initialMode);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(toLocalDateInput(defaultDate));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [taskTime, setTaskTime] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const createDeadline = useCreateDeadline();
  const createMeeting = useCreateMeeting();
  const createTask = useCreateDashboardTask();

  const resetForm = useCallback(() => {
    setTitle("");
    setDate(toLocalDateInput(defaultDate));
    setStartTime("09:00");
    setEndTime("10:00");
    setTaskTime("");
    setProjectId(defaultProjectId ?? "");
    setPriority("MEDIUM");
    setLocation("");
    setNotes("");
  }, [defaultDate, defaultProjectId]);

  useEffect(() => {
    if (!open) return;
    setType(initialMode);
    resetForm();
  }, [open, initialMode, resetForm]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (type === "deadline") {
      await createDeadline.mutateAsync({
        title: title.trim(),
        date,
        projectId: projectId || undefined,
        priority,
      });
    } else if (type === "meeting") {
      await createMeeting.mutateAsync({
        title: title.trim(),
        date,
        startTime,
        endTime: endTime || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        projectId: projectId || undefined,
      });
    } else {
      const scheduledAt = taskTime ? `${date}T${taskTime}:00` : undefined;
      await createTask.mutateAsync({
        title: title.trim(),
        dueDate: date,
        scheduledAt,
        projectId: projectId || undefined,
        priority,
        notes: notes.trim() || undefined,
      });
    }
    resetForm();
    onClose();
  };

  const isPending =
    createDeadline.isPending || createMeeting.isPending || createTask.isPending;

  const titlePlaceholder =
    type === "deadline"
      ? "Titre de la deadline"
      : type === "task"
        ? "Titre de la tâche"
        : "Titre de la réunion";

  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", modalOverlay)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cn(glassPanel, "flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden")}>
        <div className="flex items-center justify-between border-b border-app px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-4 w-0.5 shrink-0 rounded-full bg-studio-light" />
            <h3 id="quick-add-title" className="text-base font-semibold text-app-primary">
              Ajout rapide
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-glass-muted transition hover:bg-[color:var(--glass-bg-hover)] hover:text-glass"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex gap-1.5">
            {MODES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setType(id)}
                className={cn(
                  "flex-1 rounded-lg py-2 text-xs font-medium transition sm:text-sm",
                  type === id ? filterChipActive : filterChipInactive
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <QuickAddField label="Titre">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder}
              className={quickAddInput}
              required
              autoFocus
            />
          </QuickAddField>

          <div
            className={cn(
              "grid gap-3",
              type === "meeting" || type === "task" ? "grid-cols-2" : "grid-cols-1"
            )}
          >
            <QuickAddField label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={quickAddInput}
                required
              />
            </QuickAddField>

            {type === "task" && (
              <QuickAddField label="Heure (optionnel)">
                <input
                  type="time"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  className={quickAddInput}
                />
              </QuickAddField>
            )}

            {type === "meeting" && (
              <>
                <QuickAddField label="Début">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={quickAddInput}
                  />
                </QuickAddField>
                <QuickAddField label="Fin">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={quickAddInput}
                  />
                </QuickAddField>
              </>
            )}
          </div>

          {type === "meeting" && (
            <QuickAddField label="Lieu (optionnel)">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bureau, visio, chantier…"
                className={quickAddInput}
              />
            </QuickAddField>
          )}

          {(type === "deadline" || type === "task") && (
            <QuickAddField label="Priorité">
              <PriorityChips value={priority} onChange={setPriority} />
            </QuickAddField>
          )}

          {projects.length > 0 && (
            <QuickAddField label="Projet">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={quickAddSelect}
              >
                <option value="">Sans projet</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </QuickAddField>
          )}

          {(type === "task" || type === "meeting") && (
            <QuickAddField label="Notes (optionnel)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  type === "task" ? "Détails, rappels…" : "Ordre du jour, participants…"
                }
                className={quickAddTextarea}
                rows={2}
              />
            </QuickAddField>
          )}

          <div className="flex justify-end gap-2 border-t border-app pt-4">
            <button type="button" onClick={onClose} className={glassBtnSecondary}>
              Annuler
            </button>
            <button type="submit" disabled={isPending} className={glassBtnPrimary}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
