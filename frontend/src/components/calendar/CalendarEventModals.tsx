"use client";

import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { useDialog } from "@/components/providers/DialogProvider";
import CalendarEventForm from "./CalendarEventForm";
import {
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useUpdateCalendarEvent,
} from "@/hooks/useCalendar";
import type { CalendarEvent } from "@/types";
import {
  CALENDAR_EVENT_TYPE_COLORS,
  CALENDAR_EVENT_TYPE_LABELS,
} from "@/types";
import { FinanceFormSection } from "@/components/finances/finance-form-ui";
import {
  calendarLink,
  calendarModalLabel,
  calendarModalTypeBadge,
  calendarModalValue,
} from "./calendar-ui";
import { glassBtnPrimary, glassBtnSecondary } from "@/lib/glass-styles";
import { cn, formatDate } from "@/lib/utils";
import { formatEventTime, isEventDone } from "@/lib/calendar";

interface CalendarEventDetailModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onEditCustom?: (event: CalendarEvent) => void;
}

export default function CalendarEventDetailModal({
  event,
  open,
  onClose,
  onEditCustom,
}: CalendarEventDetailModalProps) {
  const deleteEvent = useDeleteCalendarEvent();
  const { confirm } = useDialog();

  if (!event) return null;

  const done = isEventDone(event);
  const time = formatEventTime(event);

  const handleDelete = async () => {
    if (!event.editable || event.source !== "custom") return;
    const ok = await confirm({
      title: "Supprimer l'événement",
      message: `Supprimer « ${event.title} » ?`,
      variant: "danger",
      confirmLabel: "Supprimer",
    });
    if (!ok) return;
    deleteEvent.mutate(event.id, { onSuccess: onClose });
  };

  const projectLink = event.projectId ? `/projects/${event.projectId}` : null;
  const clientLink = event.clientId ? `/clients/${event.clientId}` : null;
  const invoiceLink = event.invoiceId ? `/invoices/${event.invoiceId}` : null;

  return (
    <Modal isOpen={open} onClose={onClose} title={event.title} variant="glass" size="md">
      <div className="space-y-3.5">
        <FinanceFormSection title="Détails">
          <span className={cn(calendarModalTypeBadge, CALENDAR_EVENT_TYPE_COLORS[event.type])}>
            {CALENDAR_EVENT_TYPE_LABELS[event.type]}
            {done && " · Terminé"}
          </span>

          <dl className="space-y-2.5">
            <div className="flex gap-2">
              <dt className={calendarModalLabel}>Date</dt>
              <dd className={calendarModalValue}>
                {formatDate(event.date)}
                {time && ` · ${time}`}
              </dd>
            </div>
            {event.projectName && (
              <div className="flex gap-2">
                <dt className={calendarModalLabel}>Projet</dt>
                <dd>
                  {projectLink ? (
                    <Link href={projectLink} className={calendarLink}>
                      {event.projectName}
                    </Link>
                  ) : (
                    <span className={calendarModalValue}>{event.projectName}</span>
                  )}
                </dd>
              </div>
            )}
            {event.clientName && (
              <div className="flex gap-2">
                <dt className={calendarModalLabel}>Client</dt>
                <dd>
                  {clientLink ? (
                    <Link href={clientLink} className={calendarLink}>
                      {event.clientName}
                    </Link>
                  ) : (
                    <span className={calendarModalValue}>{event.clientName}</span>
                  )}
                </dd>
              </div>
            )}
            {event.location && (
              <div className="flex gap-2">
                <dt className={calendarModalLabel}>Lieu</dt>
                <dd className={calendarModalValue}>{event.location}</dd>
              </div>
            )}
            {event.notes && (
              <div className="flex gap-2">
                <dt className={calendarModalLabel}>Notes</dt>
                <dd className="whitespace-pre-wrap text-[12px] text-glass-muted">
                  {event.notes}
                </dd>
              </div>
            )}
          </dl>
        </FinanceFormSection>

        <div className="flex flex-wrap gap-2 border-t border-app pt-4">
          {projectLink && (
            <Link href={projectLink} className={glassBtnSecondary}>
              Ouvrir projet
            </Link>
          )}
          {clientLink && (
            <Link href={clientLink} className={glassBtnSecondary}>
              Ouvrir client
            </Link>
          )}
          {invoiceLink && (
            <Link href={invoiceLink} className={glassBtnSecondary}>
              Ouvrir facture
            </Link>
          )}
          {event.source === "custom" && event.editable && (
            <>
              <button
                type="button"
                onClick={() => {
                  onEditCustom?.(event);
                  onClose();
                }}
                className={cn(glassBtnPrimary, "px-3 py-1.5 text-xs")}
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-rose-400/25 bg-rose-500/[0.06] px-3 py-1.5 text-xs text-rose-300/90 transition hover:bg-rose-500/10"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface CalendarEventCreateModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
  editing?: CalendarEvent | null;
}

export function CalendarEventCreateModal({
  open,
  onClose,
  defaultDate,
  editing,
}: CalendarEventCreateModalProps) {
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();

  const handleSubmit = (payload: Partial<CalendarEvent>) => {
    if (editing?.source === "custom") {
      updateEvent.mutate(
        { id: editing.id, ...payload },
        { onSuccess: onClose }
      );
      return;
    }
    createEvent.mutate(payload, { onSuccess: onClose });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={editing ? "Modifier l'événement" : "Ajouter un événement"}
      size="lg"
      variant="glass"
    >
      <CalendarEventForm
        initial={editing}
        defaultDate={defaultDate}
        onSubmit={handleSubmit}
        loading={createEvent.isPending || updateEvent.isPending}
        submitLabel={editing ? "Enregistrer" : "Créer"}
      />
    </Modal>
  );
}
