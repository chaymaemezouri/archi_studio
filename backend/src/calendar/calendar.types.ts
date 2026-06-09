import {
  CalendarEventPriority,
  CalendarEventStatus,
  CalendarEventType,
} from '@prisma/client';

export type CalendarEventSource =
  | 'custom'
  | 'project'
  | 'deadline'
  | 'task'
  | 'meeting'
  | 'chantier'
  | 'invoice'
  | 'payment';

export interface CalendarEventDto {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  invoiceId?: string | null;
  priority?: string;
  status?: string;
  notes?: string | null;
  location?: string | null;
  source: CalendarEventSource;
  sourceId?: string;
  editable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function toIsoDate(d: Date): string {
  return d.toISOString();
}

export function mapPriority(p: string | undefined): string {
  if (p === 'URGENT' || p === 'HIGH') return 'URGENT';
  return 'NORMAL';
}

export function isUrgentPriority(p: string | undefined): boolean {
  return p === 'URGENT' || p === 'HIGH';
}
