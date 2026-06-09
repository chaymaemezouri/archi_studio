import { Module } from '@nestjs/common';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { UploadsModule } from '../uploads/uploads.module';
import { PlansRendersController } from './plans-renders.controller';
import { PlansRendersService } from './plans-renders.service';

@Module({
  imports: [ActivityLogsModule, UploadsModule],
  controllers: [PlansRendersController],
  providers: [PlansRendersService],
  exports: [PlansRendersService],
})
export class PlansRendersModule {}
