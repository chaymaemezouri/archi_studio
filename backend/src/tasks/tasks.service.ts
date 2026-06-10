import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Priority, TaskStatus } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { SmartAlertsService } from '../notifications/smart-alerts.service';
import type { AuthUser } from '../common/types/auth-user';
import {
  projectByIdWhere,
  projectRelationWhere,
  toProjectAccessContext,
} from '../common/utils/project-access.util';
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
    private smartAlerts: SmartAlertsService,
  ) {}

  private async syncTaskNotifications(studioId: string) {
    try {
      await this.smartAlerts.syncForStudio(studioId);
    } catch {
      /* sync best-effort — cron rattrape si échec */
    }
  }

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

  private studioScope(user: Pick<AuthUser, 'studioId' | 'id' | 'role'>) {
    const ctx = toProjectAccessContext(user);
    return {
      OR: [
        { project: projectRelationWhere(ctx) },
        { studioId: user.studioId, projectId: null },
      ],
    };
  }

  private async assertProjectAccess(
    projectId: string,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    const project = await this.prisma.project.findFirst({
      where: projectByIdWhere(toProjectAccessContext(user), projectId),
      select: { id: true, clientId: true },
    });
    if (!project) {
      throw new BadRequestException('Projet introuvable ou inaccessible.');
    }
    return project;
  }

  findAll(
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
    filters?: {
      projectId?: string;
      clientId?: string;
      status?: TaskStatus;
      priority?: Priority;
      from?: string;
      to?: string;
    },
  ) {
    const ctx = toProjectAccessContext(user);
    const conditions: Record<string, unknown>[] = [this.studioScope(user)];

    if (filters?.projectId) {
      conditions.push({ projectId: filters.projectId });
    }

    if (filters?.clientId) {
      conditions.push({
        OR: [
          { clientId: filters.clientId },
          {
            project: {
              clientId: filters.clientId,
              ...projectRelationWhere(ctx),
            },
          },
        ],
      });
    }

    const where: Record<string, unknown> =
      conditions.length === 1 ? conditions[0] : { AND: conditions };

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

  async findOne(id: string, user: Pick<AuthUser, 'studioId' | 'id' | 'role'>) {
    const task = await this.prisma.task.findFirst({
      where: { AND: [{ id }, this.studioScope(user)] },
      include: taskInclude,
    });
    if (!task) throw new NotFoundException('Task not found');
    return this.mapTask(task);
  }

  async create(
    dto: CreateTaskDto,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    let clientId = dto.clientId;
    if (dto.projectId && !clientId) {
      const project = await this.assertProjectAccess(dto.projectId, user);
      clientId = project.clientId ?? undefined;
    } else if (dto.projectId) {
      await this.assertProjectAccess(dto.projectId, user);
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
        studioId: user.studioId,
      },
      include: taskInclude,
    });

    if (task.projectId) {
      await this.activityLogs.log({
        userId: user.id,
        projectId: task.projectId,
        action: 'created',
        entity: 'Task',
        entityId: task.id,
        details: { title: task.title },
      });
    }

    await this.syncTaskNotifications(user.studioId);

    return this.mapTask(task);
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    const existing = await this.findOne(id, user);

    let clientId = dto.clientId;
    if (dto.projectId !== undefined && dto.projectId && !clientId) {
      const project = await this.assertProjectAccess(dto.projectId, user);
      clientId = project.clientId ?? undefined;
    } else if (dto.projectId) {
      await this.assertProjectAccess(dto.projectId, user);
    }

    const status = dto.status;
    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.dueDate !== undefined) {
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.scheduledAt !== undefined) {
      data.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    }
    if (dto.projectId !== undefined) data.projectId = dto.projectId;
    if (dto.clientId !== undefined || clientId !== undefined) {
      data.clientId = clientId;
    }
    if (dto.notes !== undefined) data.notes = dto.notes;

    if (status === TaskStatus.DONE) {
      data.completedAt = new Date();
    } else if (status !== undefined) {
      data.completedAt = null;
    }

    const task = await this.prisma.task.update({
      where: { id },
      data,
      include: taskInclude,
    });

    if (task.projectId) {
      await this.activityLogs.log({
        userId: user.id,
        projectId: task.projectId,
        action: status === TaskStatus.DONE ? 'completed' : 'updated',
        entity: 'Task',
        entityId: task.id,
        details: { title: task.title },
      });
    }

    await this.syncTaskNotifications(user.studioId);

    return this.mapTask(task);
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    return this.update(id, { status }, user);
  }

  async complete(id: string, user: Pick<AuthUser, 'studioId' | 'id' | 'role'>) {
    return this.updateStatus(id, TaskStatus.DONE, user);
  }

  async remove(id: string, user: Pick<AuthUser, 'studioId' | 'id' | 'role'>) {
    const task = await this.findOne(id, user);
    await this.prisma.task.delete({ where: { id } });

    if (task.projectId) {
      await this.activityLogs.log({
        userId: user.id,
        projectId: task.projectId,
        action: 'deleted',
        entity: 'Task',
        entityId: id,
        details: { title: task.title },
      });
    }

    await this.syncTaskNotifications(user.studioId);

    return { deleted: true };
  }
}
