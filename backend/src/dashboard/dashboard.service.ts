import { Injectable } from '@nestjs/common';
import {
  DevisStatus,
  InvoiceStatus,
  Priority,
  ProjectStatus,
  Role,
  TaskStatus,
} from '@prisma/client';
import {
  projectListWhere,
  projectRelationWhere,
} from '../common/utils/project-access.util';
import {
  addDays,
  addMonths,
  endOfDay,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { SmartAlertsService } from '../notifications/smart-alerts.service';
import {
  buildActivityByDay,
  buildRevenueByMonth,
} from './dashboard-chart-series';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private smartAlerts: SmartAlertsService,
  ) {}

  async getOverview(studioId: string, userId: string, userRole?: string) {
    await this.smartAlerts.syncForUser(userId, studioId);
    const smartAlerts = await this.smartAlerts.buildSmartAlerts(studioId, userId, userRole as Role);
    const access = {
      studioId,
      userId,
      role: userRole as Role,
    };
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const tomorrowStart = startOfDay(addDays(now, 1));
    const tomorrowEnd = endOfDay(addDays(now, 1));
    const weekEnd = endOfDay(addDays(now, 7));
    const calendarStart = startOfDay(addDays(now, -30));
    const calendarEnd = endOfDay(addDays(now, 90));
    const activityChartStart = startOfDay(addDays(now, -13));
    const paymentsChartStart = startOfMonth(addMonths(now, -5));

    const projectScope = projectRelationWhere(access);
    const studioScope = {
      OR: [
        { project: projectScope },
        { studioId, projectId: null },
      ],
    };
    const studioInvoiceScope = {
      OR: [{ client: { studioId } }, { project: projectScope }],
    };
    const unpaidStatuses = [
      InvoiceStatus.UNPAID,
      InvoiceStatus.PARTIAL,
      InvoiceStatus.SENT,
      InvoiceStatus.OVERDUE,
    ];

    const taskDayFilter = (start: Date, end: Date) => ({
      AND: [
        studioScope,
        {
          OR: [
            { scheduledAt: { gte: start, lte: end } },
            { dueDate: { gte: start, lte: end } },
          ],
        },
      ],
    });

    const todayTaskFilter = {
      AND: [
        studioScope,
        {
          OR: [
            {
              OR: [
                { scheduledAt: { gte: todayStart, lte: todayEnd } },
                { dueDate: { gte: todayStart, lte: todayEnd } },
              ],
            },
            { priority: Priority.URGENT },
          ],
        },
      ],
    };

    const [
      activeProjectsCount,
      upcomingDeadlinesCount,
      pendingDevisCount,
      pendingInvoicesCount,
      paymentsCount,
      unpaidInvoicesAgg,
      overdueInvoicesCount,
      lastPayment,
      nextDeadline,
      todayTasks,
      tomorrowTasks,
      calendarTasks,
      upcomingDeadlines,
      calendarDeadlines,
      meetings,
      recentActivity,
      recentPayments,
      importantNotifications,
      projectsInProgress,
      activityForChart,
      paymentsForChart,
    ] = await Promise.all([
      this.prisma.project.count({
        where: { studioId, status: ProjectStatus.ACTIVE },
      }),
      this.prisma.deadline.count({
        where: {
          done: false,
          date: { gte: todayStart, lte: weekEnd },
          project: projectScope,
        },
      }),
      this.prisma.devis.count({
        where: {
          status: { in: [DevisStatus.DRAFT, DevisStatus.SENT] },
          OR: [{ project: projectScope }, { client: { studioId } }],
        },
      }),
      this.prisma.invoice.count({
        where: { status: { in: unpaidStatuses }, ...studioInvoiceScope },
      }),
      this.prisma.payment.count({
        where: { invoice: studioInvoiceScope },
      }),
      this.prisma.invoice.aggregate({
        where: { status: { in: unpaidStatuses }, ...studioInvoiceScope },
        _sum: { totalTTC: true },
      }),
      this.prisma.invoice.count({
        where: { status: InvoiceStatus.OVERDUE, ...studioInvoiceScope },
      }),
      this.prisma.payment.findFirst({
        where: { invoice: studioInvoiceScope },
        orderBy: { date: 'desc' },
        include: {
          invoice: {
            select: {
              number: true,
              client: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.deadline.findFirst({
        where: {
          done: false,
          date: { gte: todayStart },
          project: projectScope,
        },
        orderBy: { date: 'asc' },
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.task.findMany({
        where: {
          ...todayTaskFilter,
          status: { not: TaskStatus.DONE },
        },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        take: 30,
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.task.findMany({
        where: {
          ...taskDayFilter(tomorrowStart, tomorrowEnd),
          status: { not: TaskStatus.DONE },
        },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        take: 30,
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.task.findMany({
        where: {
          project: projectScope,
          OR: [
            { dueDate: { gte: calendarStart, lte: calendarEnd } },
            { scheduledAt: { gte: calendarStart, lte: calendarEnd } },
          ],
        },
        orderBy: { dueDate: 'asc' },
        take: 200,
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.deadline.findMany({
        where: {
          done: false,
          date: { gte: todayStart, lte: weekEnd },
          project: projectScope,
        },
        orderBy: { date: 'asc' },
        take: 15,
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.deadline.findMany({
        where: {
          date: { gte: calendarStart, lte: calendarEnd },
          project: projectScope,
        },
        orderBy: { date: 'asc' },
        take: 200,
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.meeting.findMany({
        where: {
          date: { gte: calendarStart, lte: calendarEnd },
          project: projectScope,
        },
        orderBy: { date: 'asc' },
        take: 200,
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.activityLog.findMany({
        where: { project: projectScope },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      }),
      this.prisma.payment.findMany({
        where: { invoice: studioInvoiceScope },
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              client: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.notification.findMany({
        where: { read: false, user: { studioId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.project.findMany({
        where: {
          ...projectListWhere(access),
          status: ProjectStatus.ACTIVE,
        },
        orderBy: { updatedAt: 'desc' },
        take: 12,
        include: {
          client: { select: { id: true, name: true } },
          manager: { select: { id: true, name: true, avatar: true } },
          phaseProgress: true,
          deadlines: {
            where: { done: false },
            orderBy: { date: 'asc' },
            take: 1,
          },
        },
      }),
      this.prisma.activityLog.findMany({
        where: {
          project: projectScope,
          createdAt: { gte: activityChartStart },
        },
        select: { createdAt: true },
      }),
      this.prisma.payment.findMany({
        where: {
          invoice: studioInvoiceScope,
          date: { gte: paymentsChartStart },
        },
        select: { date: true, amount: true },
      }),
    ]);

    return {
      stats: {
        activeProjects: activeProjectsCount,
        upcomingDeadlines: upcomingDeadlinesCount,
        pendingDevis: pendingDevisCount,
        pendingInvoices: pendingInvoicesCount,
        paymentsCount,
        unpaidInvoicesAmount: unpaidInvoicesAgg._sum.totalTTC ?? 0,
        overdueInvoicesCount,
        lastPaymentDate: lastPayment?.date ?? null,
        lastPaymentAmount: lastPayment?.amount ?? null,
        lastPaymentLabel:
          lastPayment?.invoice?.client?.name ??
          lastPayment?.invoice?.number ??
          null,
        nextDeadlineDate: nextDeadline?.date ?? null,
        nextDeadlineTitle: nextDeadline?.title ?? null,
        nextDeadlineProject: nextDeadline?.project?.name ?? null,
      },
      todayTasks,
      tomorrowTasks,
      calendarTasks,
      upcomingDeadlines,
      calendarDeadlines,
      meetings,
      recentActivity,
      recentPayments,
      importantNotifications,
      projectsInProgress,
      smartAlerts,
      charts: {
        activityByDay: buildActivityByDay(activityForChart, now),
        revenueByMonth: buildRevenueByMonth(paymentsForChart, now),
      },
    };
  }
}
