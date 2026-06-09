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
import { Priority, TaskStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('projectId') projectId?: string,
    @Query('clientId') clientId?: string,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: Priority,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.tasksService.findAll(user.studioId, {
      projectId,
      clientId,
      status,
      priority,
      from,
      to,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.tasksService.findOne(id, user.studioId);
  }

  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: AuthUser) {
    return this.tasksService.create(dto, user.studioId, user.id);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.tasksService.complete(id, user.studioId, user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.updateStatus(id, status, user.studioId, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasksService.update(id, dto, user.studioId, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.tasksService.remove(id, user.studioId, user.id);
  }
}
