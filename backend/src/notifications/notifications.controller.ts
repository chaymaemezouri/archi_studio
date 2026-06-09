import {

  Body,

  Controller,

  Delete,

  Get,

  Param,

  Patch,

  Post,

  Query,

} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';

import type { AuthUser } from '../common/decorators/current-user.decorator';

import { CreateNotificationDto } from './dto/create-notification.dto';

import { UpdateNotificationDto } from './dto/update-notification.dto';

import { NotificationsService } from './notifications.service';

import { SmartAlertsService } from './smart-alerts.service';



@Controller('notifications')

export class NotificationsController {

  constructor(

    private notificationsService: NotificationsService,

    private smartAlerts: SmartAlertsService,

  ) {}



  @Get()

  findAll(

    @CurrentUser() user: AuthUser,

    @Query('unreadOnly') unreadOnly?: string,

  ) {

    return this.notificationsService.findAll(

      user.id,

      unreadOnly === 'true',

    );

  }



  @Get('unread-count')
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.notificationsService.countUnreadSummary(user.id);
  }



  @Post('sync')

  async sync(@CurrentUser() user: AuthUser) {

    await this.smartAlerts.syncForUser(user.id, user.studioId);

    return { synced: true };

  }



  @Patch('read-all')

  markAllRead(@CurrentUser() user: AuthUser) {

    return this.notificationsService.markAllRead(user.id);

  }



  @Get(':id')

  findOne(@Param('id') id: string) {

    return this.notificationsService.findOne(id);

  }



  @Post()

  create(@Body() dto: CreateNotificationDto) {

    return this.notificationsService.create(dto);

  }



  @Patch(':id/read')

  markRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {

    return this.notificationsService.markRead(id, user.id);

  }



  @Patch(':id')

  update(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {

    return this.notificationsService.update(id, dto);

  }



  @Delete(':id')

  remove(@Param('id') id: string) {

    return this.notificationsService.remove(id);

  }

}


