"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, CheckSquare, FileText, HardHat, ImagePlus, Users, X } from "lucide-react";
import { toLocalDateInput } from "@/lib/dates";
import { CHANTIER_PHASE_OPTIONS } from "@/lib/chantier-phases";
import {
  filterChipActive,
  filterChipInactive,
  formFieldLabel,
  glassBtnPrimary,
  glassBtnSecondary,
  glassInput,
  glassPanel,
  glassSelect,
} from "@/lib/glass-styles";
import { modalOverlay } from "@/lib/theme-classes";
import { uploadProjectFile } from "@/lib/project-upload";
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
  const [siteVisit, setSiteVisit] = useState("");
  const [chantierPhase, setChantierPhase] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);

  const mutations = useProjectDetailMutations(projectId);

  const resetForm = () => {
    setTitle("");
    setSiteVisit("");
    setChantierPhase("");
    setDescription("");
    setProgress("");
    setPhotoFiles([]);
    setReportFile(null);
    setLocation("");
  };

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setDate(toLocalDateInput(new Date()));
      resetForm();
    }
  }, [open, initialMode]);

  if (!open) return null;

  const isPending =
    mutations.createTask.isPending ||
    mutations.createDeadline.isPending ||
    mutations.createMeeting.isPending ||
    mutations.createChantierLog.isPending ||
    uploading;

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
        setUploading(true);

        const photoUrls: string[] = [];
        for (const file of photoFiles) {
          const uploaded = await uploadProjectFile(projectId, file, "images");
          photoUrls.push(uploaded.url);
        }

        let reportUrl: string | undefined;
        let reportName: string | undefined;
        if (reportFile) {
          const uploaded = await uploadProjectFile(projectId, reportFile, "documents");
          reportUrl = uploaded.url;
          reportName = uploaded.originalName || reportFile.name;
        }

        await mutations.createChantierLog.mutateAsync({
          date,
          siteVisit: siteVisit.trim() || undefined,
          chantierPhase: chantierPhase || undefined,
          description: description.trim(),
          progress: progress ? Number(progress) : undefined,
          photos: photoUrls.length ? photoUrls : undefined,
          reportUrl,
          reportName,
        });
        setUploading(false);
      }
      resetForm();
      onClose();
    } catch {
      setUploading(false);
    }
  };

  const inputClass = cn(glassInput, "px-3");
  const selectClass = cn(glassSelect, "w-full px-3 py-2.5");

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
        className={cn(glassPanel, "max-h-[90vh] w-full max-w-md overflow-hidden")}
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

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(90vh-4.5rem)] space-y-4 overflow-y-auto px-5 py-4"
        >
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
            <>
              <div className="space-y-1.5">
                <span className={formFieldLabel}>Visite du chantier</span>
                <input
                  value={siteVisit}
                  onChange={(e) => setSiteVisit(e.target.value)}
                  placeholder="Ex. Visite de contrôle, réunion de chantier…"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <span className={formFieldLabel}>Phase du chantier</span>
                <select
                  value={chantierPhase}
                  onChange={(e) => setChantierPhase(e.target.value)}
                  className={cn(selectClass, !chantierPhase && "text-glass-muted")}
                >
                  <option value="">Sélectionner…</option>
                  {CHANTIER_PHASE_OPTIONS.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
              </div>

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
            </>
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
            <>
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

              <div className="space-y-1.5">
                <span className={formFieldLabel}>Ajouter des photos</span>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length) {
                      setPhotoFiles((prev) => [...prev, ...files]);
                    }
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className={cn(
                    glassBtnSecondary,
                    "flex w-full items-center justify-center gap-2 py-2.5 text-[12px]"
                  )}
                >
                  <ImagePlus className="h-4 w-4" />
                  Choisir des photos
                </button>
                {photoFiles.length > 0 && (
                  <ul className="space-y-1 text-[11px] text-glass-muted">
                    {photoFiles.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          className="shrink-0 text-rose-300/80 hover:text-rose-200"
                          onClick={() =>
                            setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          Retirer
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-1.5">
                <span className={formFieldLabel}>Ajouter PV de chantier</span>
                <input
                  ref={reportInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setReportFile(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => reportInputRef.current?.click()}
                  className={cn(
                    glassBtnSecondary,
                    "flex w-full items-center justify-center gap-2 py-2.5 text-[12px]"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  {reportFile ? "Remplacer le PV" : "Choisir un PV (PDF, Word…)"}
                </button>
                {reportFile && (
                  <p className="truncate text-[11px] text-glass-muted">{reportFile.name}</p>
                )}
              </div>
            </>
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
