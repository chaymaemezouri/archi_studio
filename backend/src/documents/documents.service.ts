import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import {
  inferDocumentFileType,
  validateUploadedFile,
} from './document-file.util';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { extname, join } from 'path';

const documentInclude = {
  project: { select: { id: true, name: true, clientId: true } },
  client: { select: { id: true, name: true } },
} as const;

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
    private uploadsService: UploadsService,
  ) {}

  private mapDocument(doc: {
    id: string;
    name: string;
    originalName: string | null;
    type: string;
    mimeType: string;
    size: number;
    url: string;
    category: string;
    projectId: string | null;
    clientId: string | null;
    tags: string[];
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    project?: { id: string; name: string; clientId: string | null } | null;
    client?: { id: string; name: string } | null;
  }) {
    const clientId = doc.clientId ?? doc.project?.clientId ?? null;
    const clientName = doc.client?.name ?? null;

    return {
      ...doc,
      clientId,
      clientName,
      projectName: doc.project?.name ?? null,
      uploadedAt: doc.createdAt,
    };
  }

  findAll(
    studioId: string,
    filters?: {
      projectId?: string;
      clientId?: string;
      category?: string;
      type?: string;
      q?: string;
      unclassified?: boolean;
    },
  ) {
    const where: Record<string, unknown> = { studioId };

    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.category) where.category = filters.category;
    if (filters?.type) where.type = filters.type;
    if (filters?.unclassified) {
      where.projectId = null;
      where.clientId = null;
    }

    if (filters?.q?.trim()) {
      where.OR = [
        { name: { contains: filters.q.trim(), mode: 'insensitive' } },
        { description: { contains: filters.q.trim(), mode: 'insensitive' } },
        { type: { contains: filters.q.trim(), mode: 'insensitive' } },
        { category: { contains: filters.q.trim(), mode: 'insensitive' } },
        { project: { name: { contains: filters.q.trim(), mode: 'insensitive' } } },
        { client: { name: { contains: filters.q.trim(), mode: 'insensitive' } } },
      ];
    }

    return this.prisma.document
      .findMany({
        where,
        include: documentInclude,
        orderBy: { createdAt: 'desc' },
      })
      .then((docs) => docs.map((d) => this.mapDocument(d)));
  }

  async findOne(id: string, studioId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, studioId },
      include: documentInclude,
    });
    if (!doc) throw new NotFoundException('Document not found');
    return this.mapDocument(doc);
  }

  private async resolveClientId(
    studioId: string,
    projectId?: string,
    clientId?: string,
  ): Promise<string | undefined> {
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

  async create(
    dto: CreateDocumentDto,
    studioId: string,
    userId?: string,
  ) {
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

    const type =
      dto.type ??
      inferDocumentFileType(dto.mimeType, dto.originalName ?? dto.name);

    const doc = await this.prisma.document.create({
      data: {
        studioId,
        name: dto.name,
        originalName: dto.originalName ?? dto.name,
        type,
        mimeType: dto.mimeType,
        size: dto.size,
        url: dto.url,
        category: dto.category ?? 'OTHER',
        projectId: dto.projectId,
        clientId,
        tags: dto.tags ?? [],
        description: dto.description,
      },
      include: documentInclude,
    });

    await this.logActivity(doc, 'document_added', userId, {
      name: doc.name,
    });

    return this.mapDocument(doc);
  }

  async update(
    id: string,
    dto: UpdateDocumentDto,
    studioId: string,
    userId?: string,
  ) {
    await this.findOne(id, studioId);

    let clientId = dto.clientId;
    if (dto.projectId !== undefined || dto.clientId !== undefined) {
      clientId = await this.resolveClientId(
        studioId,
        dto.projectId ?? undefined,
        dto.clientId ?? undefined,
      );
    }

    const doc = await this.prisma.document.update({
      where: { id },
      data: {
        name: dto.name,
        originalName: dto.originalName,
        type: dto.type,
        category: dto.category,
        ...(dto.projectId !== undefined ? { projectId: dto.projectId || null } : {}),
        ...(dto.clientId !== undefined || dto.projectId !== undefined
          ? { clientId: clientId ?? null }
          : {}),
        tags: dto.tags,
        description: dto.description,
      },
      include: documentInclude,
    });

    await this.logActivity(doc, 'document_updated', userId, {
      name: doc.name,
    });

    return this.mapDocument(doc);
  }

  async remove(id: string, studioId: string, userId?: string) {
    const doc = await this.findOne(id, studioId);
    await this.prisma.document.delete({ where: { id } });

    await this.logActivity(
      {
        ...doc,
        projectId: doc.projectId,
        clientId: doc.clientId,
      },
      'document_deleted',
      userId,
      { name: doc.name },
    );

    return { deleted: true };
  }

  saveUploadedFile(
    file: Express.Multer.File,
    studioId: string,
    scope: { projectId?: string; clientId?: string },
  ) {
    const err = validateUploadedFile(file);
    if (err) throw new BadRequestException(err);

    const uploadRoot = this.uploadsService.getUploadRoot();
    let type = 'library';
    let scopeId = studioId;

    if (scope.projectId) {
      type = 'documents';
      scopeId = scope.projectId;
    } else if (scope.clientId) {
      type = 'clients';
      scopeId = scope.clientId;
    }

    const dir = join(uploadRoot, type, scopeId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${unique}${extname(file.originalname)}`;
    const destPath = join(dir, filename);

    renameSync(file.path, destPath);

    return {
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: this.uploadsService.publicUrl(type, scopeId, filename),
    };
  }

  private async logActivity(
    doc: {
      id: string;
      name: string;
      projectId?: string | null;
      clientId?: string | null;
    },
    action: string,
    userId?: string,
    details?: Prisma.InputJsonValue,
  ) {
    if (!doc.projectId && !doc.clientId) return;

    await this.activityLogs.log({
      userId,
      projectId: doc.projectId ?? undefined,
      clientId: doc.clientId ?? undefined,
      action,
      entity: 'Document',
      entityId: doc.id,
      details,
    });
  }
}
