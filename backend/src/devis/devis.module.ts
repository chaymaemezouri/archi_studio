import { Module } from '@nestjs/common';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { SettingsModule } from '../settings/settings.module';
import { DevisController } from './devis.controller';
import { DevisService } from './devis.service';

@Module({
  imports: [SettingsModule, ActivityLogsModule],
  controllers: [DevisController],
  providers: [DevisService],
  exports: [DevisService],
})
export class DevisModule {}
