import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  log(params: {
    userId?: string;
    projectId?: string;
    clientId?: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: Prisma.InputJsonValue;
  }) {
    return this.prisma.activityLog.create({ data: params });
  }

  findAll(projectId?: string) {
    return this.prisma.activityLog.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  findByProject(projectId: string) {
    return this.prisma.activityLog.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findForStudio(
    studioId: string,
    opts?: {
      projectId?: string;
      clientId?: string;
      entity?: string;
      take?: number;
    },
  ) {
    const take = opts?.take ?? 200;
    return this.prisma.activityLog.findMany({
      where: {
        OR: [{ project: { studioId } }, { client: { studioId } }],
        ...(opts?.projectId ? { projectId: opts.projectId } : {}),
        ...(opts?.clientId ? { clientId: opts.clientId } : {}),
        ...(opts?.entity ? { entity: opts.entity } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
    });
  }
}
