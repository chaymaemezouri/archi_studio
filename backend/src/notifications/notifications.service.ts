import { Injectable, NotFoundException } from '@nestjs/common';
import { NotifType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const URGENT_NOTIF_TYPES: NotifType[] = [
  NotifType.TASK_OVERDUE,
  NotifType.DEADLINE_OVERDUE,
  NotifType.INVOICE_OVERDUE,
  NotifType.MEETING_SOON,
  NotifType.DEADLINE_TODAY,
  NotifType.TASK_TODAY,
  NotifType.MEETING_TODAY,
];
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId?: string, unreadOnly?: boolean) {
    return this.prisma.notification.findMany({
      where: {
        userId: userId || undefined,
        read: unreadOnly ? false : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({ data: dto });
  }

  async upsertByKey(dto: CreateNotificationDto) {
    return this.prisma.notification.upsert({
      where: { uniqueKey: dto.uniqueKey },
      update: {
        title: dto.title,
        message: dto.message,
        link: dto.link,
        type: dto.type,
      },
      create: dto,
    });
  }

  async update(id: string, dto: UpdateNotificationDto) {
    await this.findOne(id);
    return this.prisma.notification.update({ where: { id }, data: dto });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updated: true };
  }

  async countUnreadSummary(userId: string) {
    const [count, urgentCount] = await Promise.all([
      this.prisma.notification.count({
        where: { userId, read: false },
      }),
      this.prisma.notification.count({
        where: {
          userId,
          read: false,
          type: { in: URGENT_NOTIF_TYPES },
        },
      }),
    ]);
    return { count, urgentCount };
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.notification.delete({ where: { id } });
    return { deleted: true };
  }

  async notifyUser(
    userId: string,
    type: NotifType,
    title: string,
    message: string,
    uniqueKey: string,
    link?: string,
  ) {
    return this.upsertByKey({
      userId,
      type,
      title,
      message,
      uniqueKey,
      link,
    });
  }
}
