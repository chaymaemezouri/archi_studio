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
import { CalendarEventType } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CalendarService } from './calendar.service';
import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
} from './dto/calendar-event.dto';

@Controller('calendar/events')
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('type') type?: CalendarEventType,
  ) {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .slice(0, 10);
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 3, 0)
      .toISOString()
      .slice(0, 10);

    return this.calendarService.findEvents(
      user,
      from || defaultFrom,
      to || defaultTo,
      type,
    );
  }

  @Post()
  create(@Body() dto: CreateCalendarEventDto, @CurrentUser() user: AuthUser) {
    return this.calendarService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCalendarEventDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.calendarService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.calendarService.remove(id, user);
  }
}
