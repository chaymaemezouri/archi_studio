import { Injectable } from '@nestjs/common';
import { NotifType, TaskStatus } from '@prisma/client';
import {
  addDays,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
} from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export type SmartAlertSeverity = 'overdue' | 'today' | 'tomorrow' | 'soon';
export type SmartAlertKind = 'task' | 'meeting' | 'deadline';

export interface SmartAlert {
  id: string;
  kind: SmartAlertKind;
  severity: SmartAlertSeverity;
  title: string;
  subtitle?: string;
  date: string;
  time?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  entityId: string;
  done?: boolean;
}

@Injectable()
export class SmartAlertsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /** Génère notifications intelligentes pour un utilisateur du studio. */
  async syncForUser(userId: string, studioId: string): Promise<void> {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = startOfDay(addDays(now, 1));
    const in3 = endOfDay(addDays(now, 3));
    const in7 = endOfDay(addDays(now, 7));
    const projectScope = { studioId };

    const [tasks, meetings, deadlines] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          status: { not: TaskStatus.DONE },
          project: projectScope,
          OR: [
            { dueDate: { not: null } },
            { scheduledAt: { not: null } },
          ],
        },
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.meeting.findMany({
        where: {
          project: projectScope,
          date: { gte: startOfDay(addDays(now, -1)), lte: endOfDay(addDays(now, 14)) },
        },
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.deadline.findMany({
        where: {
          done: false,
          project: projectScope,
          date: { lte: in7 },
        },
        include: { project: { select: { id: true, name: true } } },
      }),
    ]);

    for (const task of tasks) {
      const due = task.dueDate ?? task.scheduledAt;
      if (!due) continue;
      const link = task.projectId
        ? `/projects/${task.projectId}`
        : '/dashboard';
      const msg = task.title;

      if (due < today && !isSameDay(due, today)) {
        await this.notifications.notifyUser(
          userId,
          NotifType.TASK_OVERDUE,
          'Tâche en retard',
          msg,
          `task-overdue-${task.id}-${userId}`,
          link,
        );
      } else if (isSameDay(due, today)) {
        await this.notifications.notifyUser(
          userId,
          NotifType.TASK_TODAY,
          'Tâche du jour',
          msg,
          `task-today-${task.id}-${userId}`,
          link,
        );
      } else if (isSameDay(due, tomorrow)) {
        await this.notifications.notifyUser(
          userId,
          NotifType.TASK_TOMORROW,
          'Tâche demain',
          msg,
          `task-tomorrow-${task.id}-${userId}`,
          link,
        );
      }
    }

    for (const meeting of meetings) {
      const link = meeting.projectId
        ? `/projects/${meeting.projectId}`
        : '/dashboard';
      const msg = meeting.startTime
        ? `${meeting.startTime} — ${meeting.title}`
        : meeting.title;

      if (isSameDay(meeting.date, today)) {
        await this.notifications.notifyUser(
          userId,
          NotifType.MEETING_TODAY,
          'Réunion aujourd\'hui',
          meeting.startTime ? `${meeting.startTime} — ${msg}` : msg,
          `meeting-today-${meeting.id}-${userId}`,
          link,
        );
        const diffHours =
          (meeting.date.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= 2) {
          await this.notifications.notifyUser(
            userId,
            NotifType.MEETING_SOON,
            'Réunion dans moins de 2 h',
            msg,
            `meeting-soon-${meeting.id}-${userId}`,
            link,
          );
        }
      }
    }

    for (const deadline of deadlines) {
      const date = deadline.date;
      const link = deadline.projectId
        ? `/projects/${deadline.projectId}`
        : '/deadlines';
      const msg = deadline.title;
      const keyBase = `deadline-${deadline.id}-${userId}-${format(date, 'yyyy-MM-dd')}`;

      if (date < today && !isSameDay(date, today)) {
        await this.notifications.notifyUser(
          userId,
          NotifType.DEADLINE_OVERDUE,
          'Deadline dépassée',
          msg,
          `${keyBase}-overdue`,
          link,
        );
      } else if (isSameDay(date, today)) {
        await this.notifications.notifyUser(
          userId,
          NotifType.DEADLINE_TODAY,
          'Deadline aujourd\'hui',
          msg,
          `${keyBase}-today`,
          link,
        );
      } else if (date <= in3) {
        await this.notifications.notifyUser(
          userId,
          NotifType.DEADLINE_3D,
          'Deadline dans 3 jours',
          msg,
          `${keyBase}-3d`,
          link,
        );
      } else if (date <= in7) {
        await this.notifications.notifyUser(
          userId,
          NotifType.DEADLINE_7D,
          'Deadline cette semaine',
          msg,
          `${keyBase}-7d`,
          link,
        );
      }
    }
  }

  async buildSmartAlerts(studioId: string): Promise<SmartAlert[]> {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = startOfDay(addDays(now, 1));
    const soonEnd = endOfDay(addDays(now, 7));
    const projectScope = { studioId };
    const alerts: SmartAlert[] = [];

    const [tasks, meetings, deadlines] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          status: { not: TaskStatus.DONE },
          project: projectScope,
        },
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.meeting.findMany({
        where: {
          project: projectScope,
          date: { gte: today, lte: soonEnd },
        },
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.deadline.findMany({
        where: {
          done: false,
          project: projectScope,
          date: { lte: soonEnd },
        },
        include: { project: { select: { id: true, name: true } } },
      }),
    ]);

    const severityOrder: Record<SmartAlertSeverity, number> = {
      overdue: 0,
      today: 1,
      tomorrow: 2,
      soon: 3,
    };

    const classify = (d: Date): SmartAlertSeverity => {
      if (d < today && !isSameDay(d, today)) return 'overdue';
      if (isSameDay(d, today)) return 'today';
      if (isSameDay(d, tomorrow)) return 'tomorrow';
      return 'soon';
    };

    for (const task of tasks) {
      const d = task.dueDate ?? task.scheduledAt;
      if (!d || d > soonEnd) continue;
      const severity = classify(d);
      alerts.push({
        id: `task-${task.id}`,
        kind: 'task',
        severity,
        title: task.title,
        subtitle: task.project?.name ?? undefined,
        date: d.toISOString(),
        projectId: task.projectId,
        projectName: task.project?.name,
        entityId: task.id,
      });
    }

    for (const meeting of meetings) {
      const severity = classify(meeting.date);
      alerts.push({
        id: `meeting-${meeting.id}`,
        kind: 'meeting',
        severity,
        title: meeting.title,
        subtitle: meeting.project?.name ?? undefined,
        date: meeting.date.toISOString(),
        time: meeting.startTime,
        projectId: meeting.projectId,
        projectName: meeting.project?.name,
        entityId: meeting.id,
      });
    }

    for (const deadline of deadlines) {
      const severity = classify(deadline.date);
      alerts.push({
        id: `deadline-${deadline.id}`,
        kind: 'deadline',
        severity,
        title: deadline.title,
        subtitle: deadline.project?.name ?? undefined,
        date: deadline.date.toISOString(),
        projectId: deadline.projectId,
        projectName: deadline.project?.name,
        entityId: deadline.id,
        done: deadline.done,
      });
    }

    return alerts.sort(
      (a, b) =>
        severityOrder[a.severity] - severityOrder[b.severity] ||
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }
}
