import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ActivityLogsService } from './activity-logs.service';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogs: ActivityLogsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('projectId') projectId?: string,
    @Query('clientId') clientId?: string,
    @Query('entity') entity?: string,
    @Query('limit') limit?: string,
  ) {
    const take = limit ? Math.min(parseInt(limit, 10) || 200, 500) : 200;
    return this.activityLogs.findForStudio(user.studioId, {
      projectId: projectId || undefined,
      clientId: clientId || undefined,
      entity: entity || undefined,
      take,
    });
  }
}
