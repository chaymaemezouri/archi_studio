import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsCron } from './notifications.cron';
import { NotificationsService } from './notifications.service';
import { SmartAlertsService } from './smart-alerts.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsCron, SmartAlertsService],
  exports: [NotificationsService, SmartAlertsService],
})
export class NotificationsModule {}
