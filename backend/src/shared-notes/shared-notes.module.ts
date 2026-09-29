import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadsModule } from '../uploads/uploads.module';
import { SharedNotesController } from './shared-notes.controller';
import { SharedNotesService } from './shared-notes.service';

@Module({
  imports: [UploadsModule, NotificationsModule],
  controllers: [SharedNotesController],
  providers: [SharedNotesService],
})
export class SharedNotesModule {}
