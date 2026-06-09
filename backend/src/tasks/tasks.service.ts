import { Injectable, NotFoundException } from '@nestjs/common';
import { Priority, TaskStatus } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const taskInclude = {
  project: {
    select: {
      id: true,
      name: true,
      clientId: true,
      client: { select: { id: true, name: true } },
    },
  },
  client: { select: { id: true, name: true } },
} as const;

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
  ) {}

  private mapTask(task: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date | null;
    scheduledAt: Date | null;
    projectId: string | null;
    clientId: string | null;
    notes: string | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    project?: {
      id: string;
      name: string;
      clientId: string | null;
      client: { id: string; name: string } | null;
    } | null;
    client?: { id: string; name: string } | null;
  }) {
    const clientId = task.clientId ?? task.project?.clientId ?? null;
    const clientName =
      task.client?.name ?? task.project?.client?.name ?? null;

    return {
      ...task,
      clientId,
      clientName,
      projectName: task.project?.name ?? null,
    };
  }

  private studioScope(studioId: string) {
    return {
      OR: [
        { project: { studioId } },
        { studioId, projectId: null },
      ],
    };
  }

  findAll(
    studioId: string,
    filters?: {
      projectId?: string;
      clientId?: string;
      status?: TaskStatus;
      priority?: Priority;
      from?: string;
      to?: string;
    },
  ) {
    const where: Record<string, unknown> = {
      ...this.studioScope(studioId),
    };

    if (filters?.projectId) {
      where.projectId = filters.projectId;
      delete where.OR;
    }

    if (filters?.clientId) {
      where.OR = [
        { clientId: filters.clientId },
        { project: { clientId: filters.clientId, studioId } },
      ];
    }

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;

    if (filters?.from || filters?.to) {
      where.dueDate = {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to ? { lte: new Date(filters.to) } : {}),
      };
    }

    return this.prisma.task
      .findMany({
        where,
        include: taskInclude,
        orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }],
      })
      .then((tasks) => tasks.map((t) => this.mapTask(t)));
  }

  async findOne(id: string, studioId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, ...this.studioScope(studioId) },
      include: taskInclude,
    });
    if (!task) throw new NotFoundException('Task not found');
    return this.mapTask(task);
  }

  async create(
    dto: CreateTaskDto,
    studioId: string,
    userId?: string,
  ) {
    let clientId = dto.clientId;
    if (dto.projectId && !clientId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, studioId },
        select: { clientId: true },
      });
      clientId = project?.clientId ?? undefined;
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? TaskStatus.TODO,
        priority: dto.priority ?? Priority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        projectId: dto.projectId,
        clientId,
        notes: dto.notes,
        studioId,
      },
      include: taskInclude,
    });

    if (task.projectId) {
      await this.activityLogs.log({
        userId,
        projectId: task.projectId,
        action: 'created',
        entity: 'Task',
        entityId: task.id,
        details: { title: task.title },
      });
    }

    return this.mapTask(task);
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    studioId: string,
    userId?: string,
  ) {
    const existing = await this.findOne(id, studioId);

    let clientId = dto.clientId;
    if (dto.projectId !== undefined && dto.projectId && !clientId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, studioId },
        select: { clientId: true },
      });
      clientId = project?.clientId ?? undefined;
    }

    const status = dto.status;
    let completedAt: Date | null | undefined = undefined;
    if (status === TaskStatus.DONE) {
      completedAt = new Date();
    } else if (status !== undefined) {
      completedAt = null;
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate !== undefined
          ? dto.dueDate
            ? new Date(dto.dueDate)
            : null
          : undefined,
        scheduledAt: dto.scheduledAt !== undefined
          ? dto.scheduledAt
            ? new Date(dto.scheduledAt)
            : null
          : undefined,
        projectId: dto.projectId,
        clientId,
        notes: dto.notes,
        ...(completedAt !== undefined ? { completedAt } : {}),
      },
      include: taskInclude,
    });

    if (task.projectId) {
      await this.activityLogs.log({
        userId,
        projectId: task.projectId,
        action: status === TaskStatus.DONE ? 'completed' : 'updated',
        entity: 'Task',
        entityId: task.id,
        details: { title: task.title },
      });
    }

    return this.mapTask(task);
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    studioId: string,
    userId?: string,
  ) {
    return this.update(id, { status }, studioId, userId);
  }

  async complete(id: string, studioId: string, userId?: string) {
    return this.updateStatus(id, TaskStatus.DONE, studioId, userId);
  }

  async remove(id: string, studioId: string, userId?: string) {
    const task = await this.findOne(id, studioId);
    await this.prisma.task.delete({ where: { id } });

    if (task.projectId) {
      await this.activityLogs.log({
        userId,
        projectId: task.projectId,
        action: 'deleted',
        entity: 'Task',
        entityId: id,
        details: { title: task.title },
      });
    }

    return { deleted: true };
  }
}
