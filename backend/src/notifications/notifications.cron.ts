import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SmartAlertsService } from './smart-alerts.service';

@Injectable()
export class NotificationsCron {
  private readonly logger = new Logger(NotificationsCron.name);

  constructor(
    private prisma: PrismaService,
    private smartAlerts: SmartAlertsService,
  ) {}

  /** Toutes les 5 min : notifications intelligentes par studio. */
  @Cron('*/5 * * * *')
  async handleCron() {
    this.logger.debug('Syncing smart notifications for all users');
    const users = await this.prisma.user.findMany({
      select: { id: true, studioId: true },
    });

    for (const user of users) {
      if (!user.studioId) continue;
      try {
        await this.smartAlerts.syncForUser(user.id, user.studioId);
      } catch (err) {
        this.logger.warn(`Alert sync failed for user ${user.id}: ${err}`);
      }
    }
  }
}
