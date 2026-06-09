import { Injectable, NotFoundException } from '@nestjs/common';
import { ChecklistItemStatus, ProjectStatus } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { PlansRendersService } from '../plans-renders/plans-renders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectNoteDto } from './dto/project-note.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { UpdateProjectNoteDto } from './dto/project-note.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { DEFAULT_CHECKLIST_ITEMS } from './project.constants';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
    private plansRendersService: PlansRendersService,
  ) {}

  findAll(studioId: string, status?: string) {
    return this.prisma.project.findMany({
      where: {
        studioId,
        ...(status ? { status: status as ProjectStatus } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, company: true } },
        manager: { select: { id: true, name: true, avatar: true } },
        deadlines: { orderBy: { date: 'asc' } },
        files: { select: { id: true, fileType: true } },
        tasks: {
          where: { status: { not: 'DONE' } },
          select: { id: true, priority: true, status: true },
        },
      },
    });
  }

  async findOne(id: string, studioId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, studioId },
      include: {
        client: true,
        manager: { select: { id: true, name: true, email: true, avatar: true } },
        files: { orderBy: { createdAt: 'desc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        planRenders: { orderBy: { createdAt: 'desc' } },
        checklistItems: { orderBy: { sortOrder: 'asc' } },
        projectNotes: {
          orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
        },
        tasks: {
          orderBy: { updatedAt: 'desc' },
          include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        deadlines: { orderBy: { date: 'asc' } },
        meetings: { orderBy: { date: 'asc' } },
        chantierLogs: { orderBy: { date: 'desc' } },
        devis: true,
        invoices: { include: { payments: true } },
        phaseProgress: true,
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (project.checklistItems.length === 0) {
      await this.createDefaultChecklist(id);
      project.checklistItems = await this.prisma.projectChecklistItem.findMany({
        where: { projectId: id },
        orderBy: { sortOrder: 'asc' },
      });
    }

    if (project.notes?.trim()) {
      await this.migrateLegacyNotes(id, project.notes);
      project.projectNotes = await this.prisma.projectNote.findMany({
        where: { projectId: id },
        orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      });
      project.notes = null;
    }

    return project;
  }

  private async migrateLegacyNotes(projectId: string, legacyNotes: string) {
    const count = await this.prisma.projectNote.count({ where: { projectId } });
    if (count > 0) return;
    await this.prisma.projectNote.create({
      data: {
        projectId,
        content: legacyNotes.trim(),
        title: 'Note existante',
      },
    });
    await this.prisma.project.update({
      where: { id: projectId },
      data: { notes: null },
    });
  }

  private async assertProject(projectId: string, studioId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, studioId },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('Project not found');
  }

  async createNote(
    projectId: string,
    dto: CreateProjectNoteDto,
    studioId: string,
    userId?: string,
  ) {
    await this.assertProject(projectId, studioId);
    const note = await this.prisma.projectNote.create({
      data: {
        projectId,
        content: dto.content.trim(),
        title: dto.title?.trim() || null,
        pinned: dto.pinned ?? false,
      },
    });
    await this.activityLogs.log({
      userId,
      projectId,
      action: 'note_added',
      entity: 'ProjectNote',
      entityId: note.id,
    });
    return note;
  }

  async updateNote(
    projectId: string,
    noteId: string,
    dto: UpdateProjectNoteDto,
    studioId: string,
    userId?: string,
  ) {
    await this.assertProject(projectId, studioId);
    const note = await this.prisma.projectNote.findFirst({
      where: { id: noteId, projectId },
    });
    if (!note) throw new NotFoundException('Note not found');
    const updated = await this.prisma.projectNote.update({
      where: { id: noteId },
      data: {
        ...(dto.content !== undefined ? { content: dto.content.trim() } : {}),
        ...(dto.title !== undefined ? { title: dto.title?.trim() || null } : {}),
        ...(dto.pinned !== undefined ? { pinned: dto.pinned } : {}),
      },
    });
    await this.activityLogs.log({
      userId,
      projectId,
      action: 'note_updated',
      entity: 'ProjectNote',
      entityId: noteId,
    });
    return updated;
  }

  async removeNote(projectId: string, noteId: string, studioId: string) {
    await this.assertProject(projectId, studioId);
    const note = await this.prisma.projectNote.findFirst({
      where: { id: noteId, projectId },
    });
    if (!note) throw new NotFoundException('Note not found');
    await this.prisma.projectNote.delete({ where: { id: noteId } });
    return { deleted: true };
  }

  private buildProjectDates(dto: CreateProjectDto | UpdateProjectDto) {
    const dates: { deadline?: Date; intakeDate?: Date } = {};
    if ('deadline' in dto && dto.deadline !== undefined) {
      dates.deadline = dto.deadline ? new Date(dto.deadline) : undefined;
    }
    if ('intakeDate' in dto && dto.intakeDate !== undefined) {
      dates.intakeDate = dto.intakeDate ? new Date(dto.intakeDate) : undefined;
    }
    return dates;
  }

  private async createDefaultChecklist(projectId: string) {
    await this.prisma.projectChecklistItem.createMany({
      data: DEFAULT_CHECKLIST_ITEMS.map((title, index) => ({
        projectId,
        title,
        sortOrder: index,
        status: ChecklistItemStatus.MISSING,
      })),
    });
  }

  async create(dto: CreateProjectDto, studioId: string, userId?: string) {
    const dates = this.buildProjectDates(dto);
    const project = await this.prisma.project.create({
      data: {
        ...dto,
        studioId,
        ...dates,
      },
    });
    await this.createDefaultChecklist(project.id);
    await this.activityLogs.log({
      userId,
      projectId: project.id,
      action: 'CREATE',
      entity: 'Project',
      entityId: project.id,
    });
    return project;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    studioId: string,
    userId?: string,
  ) {
    await this.findOne(id, studioId);
    const dates = this.buildProjectDates(dto);
    const project = await this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        ...dates,
      },
    });
    await this.activityLogs.log({
      userId,
      projectId: id,
      action: 'UPDATE',
      entity: 'Project',
      entityId: id,
    });
    return project;
  }

  async updateChecklistItem(
    projectId: string,
    itemId: string,
    dto: UpdateChecklistItemDto,
    studioId: string,
    userId?: string,
  ) {
    await this.findOne(projectId, studioId);
    const item = await this.prisma.projectChecklistItem.findFirst({
      where: { id: itemId, projectId },
    });
    if (!item) throw new NotFoundException('Checklist item not found');

    const clearingFile =
      dto.fileUrl === null ||
      dto.documentId === null ||
      (dto.status === ChecklistItemStatus.MISSING && item.documentId);

    if (clearingFile && item.documentId) {
      await this.prisma.document.deleteMany({
        where: { id: item.documentId, studioId },
      });
    }

    const status =
      dto.status ??
      (dto.fileUrl && dto.fileUrl !== null
        ? ChecklistItemStatus.UPLOADED
        : clearingFile
          ? ChecklistItemStatus.MISSING
          : undefined);

    const updated = await this.prisma.projectChecklistItem.update({
      where: { id: itemId },
      data: {
        notes: dto.notes,
        status,
        fileUrl: dto.fileUrl === null ? null : dto.fileUrl,
        documentId: dto.documentId === null ? null : dto.documentId,
        uploadedAt:
          dto.fileUrl && dto.fileUrl !== null
            ? new Date()
            : clearingFile
              ? null
              : undefined,
      },
    });

    await this.activityLogs.log({
      userId,
      projectId,
      action: 'UPDATE',
      entity: 'ProjectChecklistItem',
      entityId: itemId,
    });

    return updated;
  }

  async setMainImageFromAsset(
    projectId: string,
    assetId: string,
    studioId: string,
    userId?: string,
  ) {
    await this.findOne(projectId, studioId);
    const asset = await this.plansRendersService.findOne(assetId, studioId);
    if (asset.projectId !== projectId) {
      await this.plansRendersService.update(
        assetId,
        { projectId },
        studioId,
        userId,
      );
    }
    return this.plansRendersService.setMainImage(assetId, studioId, userId);
  }

  async remove(id: string, studioId: string) {
    await this.findOne(id, studioId);
    await this.prisma.project.delete({ where: { id } });
    return { deleted: true };
  }
}
