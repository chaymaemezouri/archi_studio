import { TaskStatus } from '@prisma/client';
import { startOfDay } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';

/** Jour d'agenda : date de réalisation, sinon deadline. */
export function agendaDateFilter(start: Date, end: Date) {
  return {
    OR: [
      { scheduledAt: { gte: start, lte: end } },
      {
        AND: [
          { scheduledAt: null },
          { dueDate: { gte: start, lte: end } },
        ],
      },
    ],
  };
}

/**
 * Une tâche ou une deadline non terminée dont la date est passée
 * passe au jour courant. Elle ne quitte l'agenda que lorsqu'elle est cochée.
 */
export async function rollOpenAgendaToToday(
  prisma: PrismaService,
  now = new Date(),
) {
  const todayStart = startOfDay(now);

  await prisma.task.updateMany({
    where: {
      status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
      OR: [
        { scheduledAt: { lt: todayStart } },
        {
          AND: [
            { scheduledAt: null },
            { dueDate: { not: null, lt: todayStart } },
          ],
        },
      ],
    },
    data: { scheduledAt: todayStart },
  });

  await prisma.deadline.updateMany({
    where: {
      done: false,
      date: { lt: todayStart },
    },
    data: { date: todayStart },
  });
}
