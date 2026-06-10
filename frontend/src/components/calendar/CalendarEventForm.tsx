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
import { toLocalDateInput } from "@/lib/dates";
import { glassBtnPrimary } from "@/lib/glass-styles";
import type { CalendarEvent, CalendarEventType } from "@/types";
import { CALENDAR_EVENT_TYPE_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export type CalendarEventFormValues = {
  title: string;
  type: CalendarEventType;
  date: string;
  startTime: string;
  endTime: string;
  projectId: string;
  clientId: string;
  priority: "NORMAL" | "URGENT";
  notes: string;
};

export function emptyEventForm(defaultDate?: Date): CalendarEventFormValues {
  return {
    title: "",
    type: "CUSTOM_EVENT",
    date: toLocalDateInput(defaultDate ?? new Date()),
    startTime: "",
    endTime: "",
    projectId: "",
    clientId: "",
    priority: "NORMAL",
    notes: "",
  };
}

export function eventToForm(event: CalendarEvent): CalendarEventFormValues {
  return {
    title: event.title,
    type: event.type,
    date: event.date.split("T")[0],
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    projectId: event.projectId ?? "",
    clientId: event.clientId ?? "",
    priority: event.priority === "URGENT" ? "URGENT" : "NORMAL",
    notes: event.notes ?? "",
  };
}

export function validateEventForm(values: CalendarEventFormValues): string | null {
  if (!values.title.trim()) return "Le titre est obligatoire.";
  if (!values.date) return "La date est obligatoire.";
  if (values.startTime && values.endTime && values.endTime < values.startTime) {
    return "L'heure de fin ne peut pas être avant l'heure de début.";
  }
  return null;
}

interface CalendarEventFormProps {
  initial?: CalendarEvent | null;
  defaultDate?: Date;
  onSubmit: (payload: Partial<CalendarEvent>) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function CalendarEventForm({
  initial,
  defaultDate,
  onSubmit,
  loading,
  submitLabel = "Enregistrer",
}: CalendarEventFormProps) {
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const [values, setValues] = useState(() =>
    initial ? eventToForm(initial) : emptyEventForm(defaultDate)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initial ? eventToForm(initial) : emptyEventForm(defaultDate));
  }, [initial, defaultDate]);

  const set = <K extends keyof CalendarEventFormValues>(
    key: K,
    val: CalendarEventFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEventForm(values);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onSubmit({
      title: values.title.trim(),
      type: values.type,
      date: values.date,
      startTime: values.startTime || undefined,
      endTime: values.endTime || undefined,
      projectId: values.projectId || undefined,
      clientId: values.clientId || undefined,
      priority: values.priority,
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

      <FinanceFormSection title="Événement">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FinanceFieldLabel required>Titre</FinanceFieldLabel>
            <input
              className={financeFieldClass}
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <FinanceFieldLabel required>Type</FinanceFieldLabel>
            <select
              className={financeSelectClass}
              value={values.type}
              onChange={(e) => set("type", e.target.value as CalendarEventType)}
            >
              {Object.entries(CALENDAR_EVENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Horaire">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <FinanceFieldLabel required>Date</FinanceFieldLabel>
            <input
              type="date"
              className={financeFieldClass}
              value={values.date}
              onChange={(e) => set("date", e.target.value)}
              required
            />
          </div>
          <div>
            <FinanceFieldLabel>Heure début</FinanceFieldLabel>
            <input
              type="time"
              className={financeFieldClass}
              value={values.startTime}
              onChange={(e) => set("startTime", e.target.value)}
            />
          </div>
          <div>
            <FinanceFieldLabel>Heure fin</FinanceFieldLabel>
            <input
              type="time"
              className={financeFieldClass}
              value={values.endTime}
              onChange={(e) => set("endTime", e.target.value)}
            />
          </div>
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
              <option value="">
                Aucun
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
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
              <option value="">
                Aucun
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Détails">
        <div>
          <FinanceFieldLabel>Priorité</FinanceFieldLabel>
          <select
            className={financeSelectClass}
            value={values.priority}
            onChange={(e) => set("priority", e.target.value as "NORMAL" | "URGENT")}
          >
            <option value="NORMAL">
              Normale
            </option>
            <option value="URGENT">
              Urgente
            </option>
          </select>
        </div>
        <div>
          <FinanceFieldLabel>Notes</FinanceFieldLabel>
          <textarea
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className={cn(financeFieldClass, "min-h-[72px] resize-y")}
          />
        </div>
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
