import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import {
  getDisabledNotificationTypes,
  mergeNotificationPreferences,
  type NotificationPreferences,
} from './notification-preferences';

@Injectable()
export class NotificationPreferencesService {
  constructor(private prisma: PrismaService) {}

  async getForUser(userId: string): Promise<NotificationPreferences> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true },
    });
    return mergeNotificationPreferences(user?.notificationPrefs);
  }

  async update(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferences> {
    const current = await this.getForUser(userId);
    const next = mergeNotificationPreferences({
      ...current,
      ...dto,
      types: { ...current.types, ...(dto.types ?? {}) },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationPrefs: next as unknown as Prisma.InputJsonValue,
      },
    });

    const disabledTypes = getDisabledNotificationTypes(next);
    if (disabledTypes.length > 0) {
      await this.prisma.notification.deleteMany({
        where: { userId, type: { in: disabledTypes } },
      });
    }

    return next;
  }
}
