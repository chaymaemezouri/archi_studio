import { Module } from '@nestjs/common';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { DocumentsModule } from '../documents/documents.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [ActivityLogsModule, DocumentsModule],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
