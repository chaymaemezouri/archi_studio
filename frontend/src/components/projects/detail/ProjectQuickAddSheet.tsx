"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckSquare, HardHat, Users, X } from "lucide-react";
import { toLocalDateInput } from "@/lib/dates";
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

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-[#F9F8F3] p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-stone-900">Ajouter au projet</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-200/60"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition",
                  mode === m.id
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
                )}
              >
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            ))}
          </div>

          {mode !== "chantier" ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre"
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm focus:border-[#E07820] focus:outline-none focus:ring-2 focus:ring-[#E07820]/20"
              required
            />
          ) : (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du jour de chantier…"
              rows={3}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm focus:border-[#E07820] focus:outline-none focus:ring-2 focus:ring-[#E07820]/20"
              required
            />
          )}

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm"
          />

          {mode === "meeting" && (
            <>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lieu (optionnel)"
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm"
              />
            </>
          )}

          {mode === "chantier" && (
            <input
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="Avancement chantier % (optionnel)"
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm"
            />
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-stone-600 hover:bg-stone-200/50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#E07820] px-4 py-2 text-sm font-medium text-white hover:bg-[#C96A10] disabled:opacity-50"
            >
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
