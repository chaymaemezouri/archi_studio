"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckSquare, HardHat, Users, X } from "lucide-react";
import { toLocalDateInput } from "@/lib/dates";
import {
  filterChipActive,
  filterChipInactive,
  formFieldLabel,
  glassBtnPrimary,
  glassBtnSecondary,
  glassInput,
  glassPanel,
} from "@/lib/glass-styles";
import { modalOverlay } from "@/lib/theme-classes";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";
import type { ProjectQuickAddMode } from "./project-detail-types";
import { cn } from "@/lib/utils";

interface ProjectQuickAddSheetProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  mode: ProjectQuickAddMode;
}

const MODES: { id: ProjectQuickAddMode; label: string; icon: typeof Calendar }[] = [
  { id: "task", label: "Tâche", icon: CheckSquare },
  { id: "deadline", label: "Deadline", icon: Calendar },
  { id: "meeting", label: "Réunion", icon: Users },
  { id: "chantier", label: "Chantier", icon: HardHat },
];

export default function ProjectQuickAddSheet({
  open,
  onClose,
  projectId,
  mode: initialMode,
}: ProjectQuickAddSheetProps) {
  const [mode, setMode] = useState<ProjectQuickAddMode>(initialMode);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(toLocalDateInput(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState("");

  const mutations = useProjectDetailMutations(projectId);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setDate(toLocalDateInput(new Date()));
    }
  }, [open, initialMode]);

  if (!open) return null;

  const isPending =
    mutations.createTask.isPending ||
    mutations.createDeadline.isPending ||
    mutations.createMeeting.isPending ||
    mutations.createChantierLog.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "task") {
        if (!title.trim()) return;
        await mutations.createTask.mutateAsync({ title: title.trim(), dueDate: date });
      } else if (mode === "deadline") {
        if (!title.trim()) return;
        await mutations.createDeadline.mutateAsync({ title: title.trim(), date });
      } else if (mode === "meeting") {
        if (!title.trim()) return;
        await mutations.createMeeting.mutateAsync({
          title: title.trim(),
          date,
          startTime,
          location: location.trim() || undefined,
        });
      } else {
        if (!description.trim()) return;
        await mutations.createChantierLog.mutateAsync({
          date,
          description: description.trim(),
          progress: progress ? Number(progress) : undefined,
        });
      }
      setTitle("");
      setDescription("");
      onClose();
    } catch {
      /* toast in mutation */
    }
  };

  const inputClass = cn(glassInput, "px-3");

  return (
    <div
      className={cn("fixed inset-0 z-[70] flex items-center justify-center p-4", modalOverlay)}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(glassPanel, "w-full max-w-md overflow-hidden")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-app px-5 py-4">
          <h3 className="text-lg font-semibold text-app-primary">Ajouter au projet</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-glass-muted transition hover:bg-[color:var(--glass-bg-hover)] hover:text-app-primary"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition",
                  mode === m.id ? filterChipActive : filterChipInactive
                )}
              >
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            ))}
          </div>

          {mode !== "chantier" ? (
            <div className="space-y-1.5">
              <span className={formFieldLabel}>Titre</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre"
                className={inputClass}
                required
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className={formFieldLabel}>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du jour de chantier…"
                rows={3}
                className={cn(inputClass, "min-h-[88px] resize-y")}
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <span className={formFieldLabel}>Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {mode === "meeting" && (
            <>
              <div className="space-y-1.5">
                <span className={formFieldLabel}>Heure</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <span className={formFieldLabel}>Lieu (optionnel)</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Lieu"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {mode === "chantier" && (
            <div className="space-y-1.5">
              <span className={formFieldLabel}>Avancement % (optionnel)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="0 – 100"
                className={inputClass}
              />
            </div>
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
