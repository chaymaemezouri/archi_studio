import { Module } from '@nestjs/common';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsCron } from './notifications.cron';
import { NotificationsService } from './notifications.service';
import { SmartAlertsService } from './smart-alerts.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsCron,
    SmartAlertsService,
    NotificationPreferencesService,
  ],
  exports: [
    NotificationsService,
    SmartAlertsService,
    NotificationPreferencesService,
  ],
})
export class NotificationsModule {}
