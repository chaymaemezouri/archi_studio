import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  CalendarEventType,
  InvoiceStatus,
  ProjectStatus,
  TaskStatus,
} from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import type { AuthUser } from '../common/types/auth-user';
import {
  projectByIdWhere,
  projectListWhere,
  projectRelationWhere,
  toProjectAccessContext,
} from '../common/utils/project-access.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  CalendarEventDto,
  mapPriority,
  toIsoDate,
} from './calendar.types';
import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
} from './dto/calendar-event.dto';

const UNPAID: InvoiceStatus[] = [
  InvoiceStatus.SENT,
  InvoiceStatus.UNPAID,
  InvoiceStatus.PARTIAL,
  InvoiceStatus.OVERDUE,
];

@Injectable()
export class CalendarService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
  ) {}

  async findEvents(
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
    from: string,
    to: string,
    type?: CalendarEventType,
  ): Promise<CalendarEventDto[]> {
    const ctx = toProjectAccessContext(user);
    const studioId = user.studioId;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const projectScope = projectRelationWhere(ctx);
    const projectList = projectListWhere(ctx);
    const dateRange = { gte: fromDate, lte: toDate };

    const [
      projects,
      deadlines,
      tasks,
      meetings,
      chantierLogs,
      invoices,
      payments,
      customEvents,
    ] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          ...projectList,
          status: ProjectStatus.ACTIVE,
          deadline: { not: null, ...dateRange },
        },
        include: {
          client: { select: { id: true, name: true } },
        },
      }),
      this.prisma.deadline.findMany({
        where: {
          done: false,
          date: dateRange,
          project: projectScope,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              studioId: true,
              clientId: true,
              client: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.task.findMany({
        where: {
          project: projectScope,
          status: { not: TaskStatus.DONE },
          OR: [{ dueDate: dateRange }, { scheduledAt: dateRange }],
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              clientId: true,
              client: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.meeting.findMany({
        where: {
          date: dateRange,
          project: projectScope,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              studioId: true,
              clientId: true,
              client: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.chantierLog.findMany({
        where: { date: dateRange, project: projectScope },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              clientId: true,
              client: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.invoice.findMany({
        where: {
          dueDate: { not: null, ...dateRange },
          status: { in: UNPAID },
          OR: [{ client: { studioId } }, { project: { studioId } }],
        },
        include: {
          client: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          date: dateRange,
          invoice: {
            OR: [{ client: { studioId } }, { project: { studioId } }],
          },
        },
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              clientId: true,
              client: { select: { id: true, name: true } },
              projectId: true,
              project: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.calendarEvent.findMany({
        where: {
          studioId,
          date: dateRange,
          status: { not: 'CANCELLED' },
        },
        include: {
          project: { select: { id: true, name: true } },
          client: { select: { id: true, name: true } },
        },
      }),
    ]);

    const events: CalendarEventDto[] = [];

    for (const p of projects) {
      if (!p.deadline) continue;
      events.push({
        id: `gen-proj-${p.id}`,
        title: `Deadline — ${p.name}`,
        type: CalendarEventType.DEADLINE_PROJECT,
        date: toIsoDate(p.deadline),
        projectId: p.id,
        projectName: p.name,
        clientId: p.clientId,
        clientName: p.client?.name ?? null,
        priority: 'NORMAL',
        status: 'ACTIVE',
        source: 'project',
        sourceId: p.id,
        editable: false,
        updatedAt: toIsoDate(p.updatedAt),
      });
    }

    for (const d of deadlines) {
      if (d.project && d.project.studioId !== studioId) continue;
      events.push({
        id: `gen-dl-${d.id}`,
        title: d.title,
        type: CalendarEventType.DEADLINE_PROJECT,
        date: toIsoDate(d.date),
        projectId: d.projectId,
        projectName: d.project?.name ?? null,
        clientId: d.project?.clientId ?? null,
        clientName: d.project?.client?.name ?? null,
        priority: mapPriority(d.priority),
        status: d.done ? 'DONE' : 'ACTIVE',
        source: 'deadline',
        sourceId: d.id,
        editable: true,
        createdAt: toIsoDate(d.createdAt),
      });
    }

    for (const t of tasks) {
      const eventDate = t.dueDate ?? t.scheduledAt;
      if (!eventDate) continue;
      events.push({
        id: `gen-task-${t.id}`,
        title: t.title,
        type: CalendarEventType.DEADLINE_TASK,
        date: toIsoDate(eventDate),
        projectId: t.projectId,
        projectName: t.project?.name ?? null,
        clientId: t.project?.clientId ?? null,
        clientName: t.project?.client?.name ?? null,
        priority: mapPriority(t.priority),
        status: t.status === TaskStatus.DONE ? 'DONE' : t.status,
        notes: t.description,
        source: 'task',
        sourceId: t.id,
        editable: true,
        updatedAt: toIsoDate(t.updatedAt),
      });
    }

    for (const m of meetings) {
      if (m.project && m.project.studioId !== studioId) continue;
      events.push({
        id: `gen-meeting-${m.id}`,
        title: m.title,
        type: CalendarEventType.MEETING,
        date: toIsoDate(m.date),
        startTime: m.startTime,
        endTime: m.endTime,
        projectId: m.projectId,
        projectName: m.project?.name ?? null,
        clientId: m.project?.clientId ?? null,
        clientName: m.project?.client?.name ?? null,
        notes: m.notes,
        location: m.location,
        source: 'meeting',
        sourceId: m.id,
        editable: true,
        createdAt: toIsoDate(m.createdAt),
      });
    }

    for (const c of chantierLogs) {
      events.push({
        id: `gen-chantier-${c.id}`,
        title: `Visite chantier — ${c.project.name}`,
        type: CalendarEventType.SITE_VISIT,
        date: toIsoDate(c.date),
        projectId: c.projectId,
        projectName: c.project.name,
        clientId: c.project.clientId,
        clientName: c.project.client?.name ?? null,
        notes: c.description,
        source: 'chantier',
        sourceId: c.id,
        editable: true,
        createdAt: toIsoDate(c.createdAt),
      });
    }

    for (const inv of invoices) {
      if (!inv.dueDate) continue;
      events.push({
        id: `gen-invoice-${inv.id}`,
        title: `Facture ${inv.number} — échéance`,
        type: CalendarEventType.INVOICE_REMINDER,
        date: toIsoDate(inv.dueDate),
        projectId: inv.projectId,
        projectName: inv.project?.name ?? null,
        clientId: inv.clientId,
        clientName: inv.client?.name ?? null,
        invoiceId: inv.id,
        priority: inv.status === InvoiceStatus.OVERDUE ? 'URGENT' : 'NORMAL',
        status: inv.status,
        source: 'invoice',
        sourceId: inv.id,
        editable: false,
        updatedAt: toIsoDate(inv.updatedAt),
      });
    }

    for (const pay of payments) {
      if (!pay.invoice) continue;
      events.push({
        id: `gen-payment-${pay.id}`,
        title: `Paiement reçu — ${pay.invoice.number}`,
        type: CalendarEventType.PAYMENT_REMINDER,
        date: toIsoDate(pay.date),
        projectId: pay.invoice.projectId,
        projectName: pay.invoice.project?.name ?? null,
        clientId: pay.invoice.clientId,
        clientName: pay.invoice.client?.name ?? null,
        invoiceId: pay.invoice.id,
        notes: pay.notes,
        status: 'DONE',
        source: 'payment',
        sourceId: pay.id,
        editable: false,
        createdAt: toIsoDate(pay.createdAt),
      });
    }

    for (const ev of customEvents) {
      events.push({
        id: ev.id,
        title: ev.title,
        type: ev.type,
        date: toIsoDate(ev.date),
        startTime: ev.startTime,
        endTime: ev.endTime,
        projectId: ev.projectId,
        projectName: ev.project?.name ?? null,
        clientId: ev.clientId,
        clientName: ev.client?.name ?? null,
        priority: ev.priority,
        status: ev.status,
        notes: ev.notes,
        source: 'custom',
        sourceId: ev.id,
        editable: true,
        createdAt: toIsoDate(ev.createdAt),
        updatedAt: toIsoDate(ev.updatedAt),
      });
    }

    let result = events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    if (type) {
      result = result.filter((e) => e.type === type);
    }

    return result;
  }

  async create(
    dto: CreateCalendarEventDto,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: projectByIdWhere(toProjectAccessContext(user), dto.projectId),
        select: { id: true },
      });
      if (!project) {
        throw new BadRequestException('Projet introuvable ou inaccessible.');
      }
    }

    const event = await this.prisma.calendarEvent.create({
      data: {
        studioId: user.studioId,
        title: dto.title,
        type: dto.type,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        projectId: dto.projectId,
        clientId: dto.clientId,
        priority: dto.priority,
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        project: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
    });

    if (dto.projectId || dto.clientId) {
      await this.activityLogs.log({
        userId: user.id,
        projectId: dto.projectId,
        clientId: dto.clientId,
        action: 'calendar_event_created',
        entity: 'CalendarEvent',
        entityId: event.id,
        details: { title: event.title, type: event.type },
      });
    }

    return this.mapCustomEvent(event);
  }

  async update(
    id: string,
    dto: UpdateCalendarEventDto,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    const existing = await this.prisma.calendarEvent.findFirst({
      where: { id, studioId: user.studioId },
    });
    if (!existing) throw new NotFoundException('Calendar event not found');

    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: projectByIdWhere(toProjectAccessContext(user), dto.projectId),
        select: { id: true },
      });
      if (!project) {
        throw new BadRequestException('Projet introuvable ou inaccessible.');
      }
    }

    const event = await this.prisma.calendarEvent.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
    });

    if (event.projectId || event.clientId) {
      await this.activityLogs.log({
        userId: user.id,
        projectId: event.projectId ?? undefined,
        clientId: event.clientId ?? undefined,
        action: 'calendar_event_updated',
        entity: 'CalendarEvent',
        entityId: event.id,
      });
    }

    return this.mapCustomEvent(event);
  }

  async remove(id: string, user: Pick<AuthUser, 'studioId' | 'id' | 'role'>) {
    const existing = await this.prisma.calendarEvent.findFirst({
      where: { id, studioId: user.studioId },
    });
    if (!existing) throw new NotFoundException('Calendar event not found');
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { deleted: true };
  }

  private mapCustomEvent(event: {
    id: string;
    title: string;
    type: CalendarEventType;
    date: Date;
    startTime: string | null;
    endTime: string | null;
    projectId: string | null;
    clientId: string | null;
    priority: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    project?: { id: string; name: string } | null;
    client?: { id: string; name: string } | null;
  }): CalendarEventDto {
    return {
      id: event.id,
      title: event.title,
      type: event.type,
      date: toIsoDate(event.date),
      startTime: event.startTime,
      endTime: event.endTime,
      projectId: event.projectId,
      projectName: event.project?.name ?? null,
      clientId: event.clientId,
      clientName: event.client?.name ?? null,
      priority: event.priority,
      status: event.status,
      notes: event.notes,
      source: 'custom',
      sourceId: event.id,
      editable: true,
      createdAt: toIsoDate(event.createdAt),
      updatedAt: toIsoDate(event.updatedAt),
    };
  }
}
