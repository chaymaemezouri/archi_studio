import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { extname, join } from 'path';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreatePlanRenderDto } from './dto/create-plan-render.dto';
import { UpdatePlanRenderDto } from './dto/update-plan-render.dto';
import {
  inferFileType,
  thumbnailFor,
  validatePlanRenderFile,
} from './plan-render-file.util';

const include = {
  project: { select: { id: true, name: true, clientId: true, imageUrl: true } },
  client: { select: { id: true, name: true } },
} as const;

@Injectable()
export class PlansRendersService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
    private uploadsService: UploadsService,
  ) {}

  private mapAsset(row: {
    id: string;
    name: string;
    originalName: string | null;
    kind: string;
    category: string;
    mimeType: string;
    fileType: string;
    size: number;
    url: string;
    thumbnailUrl: string | null;
    projectId: string | null;
    clientId: string | null;
    tags: string[];
    description: string | null;
    version: string | null;
    isMainImage: boolean;
    isFavorite: boolean;
    createdAt: Date;
    updatedAt: Date;
    project?: {
      id: string;
      name: string;
      clientId: string | null;
      imageUrl?: string | null;
    } | null;
    client?: { id: string; name: string } | null;
  }) {
    const clientId = row.clientId ?? row.project?.clientId ?? null;
    return {
      ...row,
      clientId,
      clientName: row.client?.name ?? null,
      projectName: row.project?.name ?? null,
      uploadedAt: row.createdAt,
    };
  }

  findAll(
    studioId: string,
    filters?: {
      kind?: string;
      projectId?: string;
      clientId?: string;
      category?: string;
      q?: string;
      unclassified?: boolean;
      favorites?: boolean;
    },
  ) {
    const where: Record<string, unknown> = { studioId };

    if (filters?.kind) where.kind = filters.kind;
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.category) where.category = filters.category;
    if (filters?.favorites) where.isFavorite = true;
    if (filters?.unclassified) {
      where.projectId = null;
      where.clientId = null;
    }

    if (filters?.q?.trim()) {
      where.OR = [
        { name: { contains: filters.q.trim(), mode: 'insensitive' } },
        { description: { contains: filters.q.trim(), mode: 'insensitive' } },
        { category: { contains: filters.q.trim(), mode: 'insensitive' } },
        { version: { contains: filters.q.trim(), mode: 'insensitive' } },
        { project: { name: { contains: filters.q.trim(), mode: 'insensitive' } } },
        { client: { name: { contains: filters.q.trim(), mode: 'insensitive' } } },
      ];
    }

    return this.prisma.planRender
      .findMany({ where, include, orderBy: { createdAt: 'desc' } })
      .then((rows) => rows.map((r) => this.mapAsset(r)));
  }

  async findOne(id: string, studioId: string) {
    const row = await this.prisma.planRender.findFirst({
      where: { id, studioId },
      include,
    });
    if (!row) throw new NotFoundException('Asset not found');
    return this.mapAsset(row);
  }

  private async resolveClientId(
    studioId: string,
    projectId?: string,
    clientId?: string,
  ) {
    if (clientId) {
      const client = await this.prisma.client.findFirst({
        where: { id: clientId, studioId },
      });
      if (!client) throw new BadRequestException('Client not found');
      return clientId;
    }
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, studioId },
        select: { clientId: true },
      });
      if (!project) throw new BadRequestException('Project not found');
      return project.clientId ?? undefined;
    }
    return undefined;
  }

  async create(dto: CreatePlanRenderDto, studioId: string, userId?: string) {
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, studioId },
      });
      if (!project) throw new BadRequestException('Project not found');
    }

    const clientId = await this.resolveClientId(
      studioId,
      dto.projectId,
      dto.clientId,
    );

    const fileType =
      dto.fileType ?? inferFileType(dto.mimeType, dto.originalName ?? dto.name);
    const thumbnailUrl =
      dto.thumbnailUrl ?? thumbnailFor(dto.mimeType, dto.url);

    const asset = await this.prisma.planRender.create({
      data: {
        studioId,
        name: dto.name,
        originalName: dto.originalName ?? dto.name,
        kind: dto.kind,
        category: dto.category,
        mimeType: dto.mimeType,
        fileType,
        size: dto.size,
        url: dto.url,
        thumbnailUrl,
        projectId: dto.projectId,
        clientId,
        tags: dto.tags ?? [],
        description: dto.description,
        version: dto.version,
        isFavorite: dto.isFavorite ?? false,
        isMainImage: dto.isMainImage ?? false,
      },
      include,
    });

    if (dto.isMainImage && dto.projectId && dto.kind === 'RENDER') {
      await this.applyMainImage(asset.id, dto.projectId, studioId, userId, false);
    } else {
      await this.logActivity(asset, dto.kind === 'PLAN' ? 'plan_added' : 'render_added', userId);
    }

    return this.findOne(asset.id, studioId);
  }

  async update(
    id: string,
    dto: UpdatePlanRenderDto,
    studioId: string,
    userId?: string,
  ) {
    const existing = await this.findOne(id, studioId);
    let clientId: string | undefined | null = undefined;

    if (dto.projectId !== undefined || dto.clientId !== undefined) {
      clientId = await this.resolveClientId(
        studioId,
        dto.projectId ?? undefined,
        dto.clientId ?? undefined,
      );
    }

    await this.prisma.planRender.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        ...(dto.projectId !== undefined ? { projectId: dto.projectId || null } : {}),
        ...(dto.clientId !== undefined || dto.projectId !== undefined
          ? { clientId: clientId ?? null }
          : {}),
        tags: dto.tags,
        description: dto.description,
        version: dto.version,
        ...(dto.isFavorite !== undefined ? { isFavorite: dto.isFavorite } : {}),
      },
      include,
    });

    if (dto.isMainImage && existing.kind === 'RENDER' && existing.projectId) {
      await this.applyMainImage(id, existing.projectId, studioId, userId);
    }

    const updated = await this.findOne(id, studioId);
    await this.logActivity(
      updated,
      updated.kind === 'PLAN' ? 'plan_updated' : 'render_updated',
      userId,
    );
    return updated;
  }

  async remove(id: string, studioId: string, userId?: string) {
    const asset = await this.findOne(id, studioId);
    await this.prisma.planRender.delete({ where: { id } });

    // A deleted asset must not stay as the project cover
    if (asset.projectId && asset.project?.imageUrl === asset.url) {
      const fallback = await this.prisma.planRender.findFirst({
        where: { projectId: asset.projectId, kind: 'RENDER', studioId },
        orderBy: { createdAt: 'desc' },
      });
      if (fallback) {
        await this.applyMainImage(
          fallback.id,
          asset.projectId,
          studioId,
          userId,
          false,
        );
      } else {
        await this.prisma.project.update({
          where: { id: asset.projectId },
          data: { imageUrl: null },
        });
      }
    }

    await this.logActivity(
      asset,
      asset.kind === 'PLAN' ? 'plan_deleted' : 'render_deleted',
      userId,
    );
    return { deleted: true };
  }

  async setMainImage(id: string, studioId: string, userId?: string) {
    const asset = await this.findOne(id, studioId);
    if (asset.kind !== 'RENDER') {
      throw new BadRequestException('Seuls les rendus peuvent être image principale.');
    }
    if (!asset.projectId) {
      throw new BadRequestException('Liez ce rendu à un projet d\'abord.');
    }
    await this.applyMainImage(id, asset.projectId, studioId, userId);
    return this.findOne(id, studioId);
  }

  private async applyMainImage(
    assetId: string,
    projectId: string,
    studioId: string,
    userId?: string,
    log = true,
  ) {
    const asset = await this.prisma.planRender.findFirst({
      where: { id: assetId, studioId },
    });
    if (!asset) throw new NotFoundException('Asset not found');

    await this.prisma.planRender.updateMany({
      where: { projectId, kind: 'RENDER', id: { not: assetId } },
      data: { isMainImage: false },
    });

    await this.prisma.planRender.update({
      where: { id: assetId },
      data: { isMainImage: true },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { imageUrl: asset.url },
    });

    if (log) {
      await this.activityLogs.log({
        userId,
        projectId,
        action: 'main_image_set',
        entity: 'PlanRender',
        entityId: assetId,
        details: { name: asset.name },
      });
    }
  }

  saveUploadedFile(
    file: Express.Multer.File,
    studioId: string,
    kind: 'PLAN' | 'RENDER',
    scope: { projectId?: string; clientId?: string },
  ) {
    const err = validatePlanRenderFile(file, kind);
    if (err) throw new BadRequestException(err);

    const uploadRoot = this.uploadsService.getUploadRoot();
    let type = 'library';
    let scopeId = studioId;

    if (scope.projectId) {
      type = kind === 'PLAN' ? 'plans' : 'renders';
      scopeId = scope.projectId;
    } else if (scope.clientId) {
      type = 'clients';
      scopeId = scope.clientId;
    }

    const dir = join(uploadRoot, type, scopeId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    renameSync(file.path, join(dir, filename));

    const url = this.uploadsService.publicUrl(type, scopeId, filename);
    return {
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      thumbnailUrl: thumbnailFor(file.mimetype, url),
    };
  }

  private async logActivity(
    asset: {
      id: string;
      name: string;
      kind: string;
      projectId?: string | null;
      clientId?: string | null;
    },
    action: string,
    userId?: string,
    details?: Prisma.InputJsonValue,
  ) {
    if (!asset.projectId && !asset.clientId) return;
    await this.activityLogs.log({
      userId,
      projectId: asset.projectId ?? undefined,
      clientId: asset.clientId ?? undefined,
      action,
      entity: 'PlanRender',
      entityId: asset.id,
      details: details ?? { name: asset.name, kind: asset.kind },
    });
  }
}
