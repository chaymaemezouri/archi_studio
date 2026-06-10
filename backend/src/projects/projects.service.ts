import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ChecklistItemStatus, ProjectStatus, ProjectVisibility, Role } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import type { AuthUser } from '../common/types/auth-user';
import {
  isProjectStudioMember,
  projectByIdWhere,
  projectListWhere,
  type ProjectAccessContext,
} from '../common/utils/project-access.util';
import { PlansRendersService } from '../plans-renders/plans-renders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateProjectNoteDto } from './dto/project-note.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { UpdateProjectNoteDto } from './dto/project-note.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ResolveLocationQueryDto } from './dto/resolve-location.dto';
import { DEFAULT_CHECKLIST_ITEMS } from './project.constants';
import { computeOverallProgress } from './project-progress.util';
import {
  isInMoroccoBounds,
  resolveFromWgs84,
  resolveMoroccoLocation,
} from '../common/utils/morocco-location.util';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
    private plansRendersService: PlansRendersService,
  ) {}

  private access(user: Pick<AuthUser, 'studioId' | 'id' | 'role'>): ProjectAccessContext {
    return {
      studioId: user.studioId,
      userId: user.id,
      role: user.role as Role,
    };
  }

  findAll(user: Pick<AuthUser, 'studioId' | 'id' | 'role'>, status?: string) {
    return this.prisma.project.findMany({
      where: {
        ...projectListWhere(this.access(user)),
        ...(status ? { status: status as ProjectStatus } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, company: true } },
        manager: { select: { id: true, name: true, avatar: true } },
        owner: { select: { id: true, name: true, avatar: true } },
        studio: { select: { id: true, name: true, slug: true } },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                studio: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
        deadlines: { orderBy: { date: 'asc' } },
        files: { select: { id: true, fileType: true } },
        tasks: {
          where: { status: { not: 'DONE' } },
          select: { id: true, priority: true, status: true },
        },
        checklistItems: { select: { status: true } },
        phaseProgress: { select: { phase: true, progress: true } },
      },
    });
  }

  async findOne(id: string, user: Pick<AuthUser, 'studioId' | 'id' | 'role'>) {
    const project = await this.prisma.project.findFirst({
      where: projectByIdWhere(this.access(user), id),
      include: {
        client: true,
        manager: { select: { id: true, name: true, email: true, avatar: true } },
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        studio: { select: { id: true, name: true, slug: true } },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                studio: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
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

    const syncedProgress = computeOverallProgress(project);
    if (project.progress !== syncedProgress) {
      await this.prisma.project.update({
        where: { id },
        data: { progress: syncedProgress },
      });
      project.progress = syncedProgress;
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

  private async assertProject(
    projectId: string,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    const project = await this.prisma.project.findFirst({
      where: projectByIdWhere(this.access(user), projectId),
      select: { id: true, ownerId: true, visibility: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  private parseCollaboratorEmails(emails?: string[]): string[] {
    if (!emails?.length) return [];
    return [
      ...new Set(
        emails
          .flatMap((entry) => entry.split(/[,;]/))
          .map((entry) => entry.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
  }

  private async inviteCollaboratorsByEmail(
    projectId: string,
    projectStudioId: string,
    inviter: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
    emails: string[],
  ) {
    if (!isProjectStudioMember(this.access(inviter), projectStudioId)) {
      throw new ForbiddenException(
        'Seul le cabinet propriétaire peut inviter des collaborateurs',
      );
    }

    const results: Array<{ email: string; status: 'invited' | 'skipped' | 'not_found' }> = [];

    for (const email of emails) {
      const collaborator = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, studioId: true, email: true },
      });

      if (!collaborator) {
        results.push({ email, status: 'not_found' });
        continue;
      }

      if (collaborator.id === inviter.id) {
        results.push({ email, status: 'skipped' });
        continue;
      }

      if (collaborator.studioId === projectStudioId) {
        results.push({ email, status: 'skipped' });
        continue;
      }

      await this.prisma.projectCollaborator.upsert({
        where: {
          projectId_userId: { projectId, userId: collaborator.id },
        },
        create: { projectId, userId: collaborator.id },
        update: {},
      });

      results.push({ email, status: 'invited' });
    }

    return results;
  }

  async addCollaborator(
    projectId: string,
    email: string,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    const project = await this.prisma.project.findFirst({
      where: projectByIdWhere(this.access(user), projectId),
      select: { id: true, studioId: true, name: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('Email requis');
    }

    const [result] = await this.inviteCollaboratorsByEmail(
      project.id,
      project.studioId,
      user,
      [normalized],
    );

    if (result?.status === 'not_found') {
      throw new NotFoundException(`Aucun compte trouvé pour ${normalized}`);
    }
    if (result?.status === 'skipped') {
      throw new BadRequestException(
        'Cet utilisateur a déjà accès au projet ou ne peut pas être invité',
      );
    }

    await this.activityLogs.log({
      userId: user.id,
      projectId,
      action: 'collaborator_invited',
      entity: 'Project',
      entityId: projectId,
      details: { email: normalized },
    });

    return this.listCollaborators(projectId, user);
  }

  async removeCollaborator(
    projectId: string,
    collaboratorUserId: string,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    const project = await this.prisma.project.findFirst({
      where: projectByIdWhere(this.access(user), projectId),
      select: { id: true, studioId: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (!isProjectStudioMember(this.access(user), project.studioId)) {
      throw new ForbiddenException(
        'Seul le cabinet propriétaire peut retirer des collaborateurs',
      );
    }

    await this.prisma.projectCollaborator.deleteMany({
      where: { projectId, userId: collaboratorUserId },
    });

    return this.listCollaborators(projectId, user);
  }

  async listCollaborators(
    projectId: string,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    await this.assertProject(projectId, user);
    return this.prisma.projectCollaborator.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            studio: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private visibilityPayload(
    visibility: ProjectVisibility | undefined,
    userId: string,
  ): { visibility: ProjectVisibility; ownerId: string | null } {
    const resolved = visibility ?? ProjectVisibility.STUDIO;
    if (resolved === ProjectVisibility.PERSONAL) {
      return { visibility: ProjectVisibility.PERSONAL, ownerId: userId };
    }
    return { visibility: ProjectVisibility.STUDIO, ownerId: null };
  }

  async createNote(
    projectId: string,
    dto: CreateProjectNoteDto,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    await this.assertProject(projectId, user);
    const note = await this.prisma.projectNote.create({
      data: {
        projectId,
        content: dto.content.trim(),
        title: dto.title?.trim() || null,
        pinned: dto.pinned ?? false,
      },
    });
    await this.activityLogs.log({
      userId: user.id,
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
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    await this.assertProject(projectId, user);
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
      userId: user.id,
      projectId,
      action: 'note_updated',
      entity: 'ProjectNote',
      entityId: noteId,
    });
    return updated;
  }

  async removeNote(
    projectId: string,
    noteId: string,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    await this.assertProject(projectId, user);
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

  async create(dto: CreateProjectDto, user: Pick<AuthUser, 'studioId' | 'id' | 'role'>) {
    const dates = this.buildProjectDates(dto);
    const { visibility, collaboratorEmails, ...rest } = dto;
    const visibilityData = this.visibilityPayload(visibility, user.id);
    const project = await this.prisma.project.create({
      data: {
        ...rest,
        studioId: user.studioId,
        ...visibilityData,
        ...dates,
      },
    });
    await this.createDefaultChecklist(project.id);
    await this.activityLogs.log({
      userId: user.id,
      projectId: project.id,
      action: 'CREATE',
      entity: 'Project',
      entityId: project.id,
    });

    const emails = this.parseCollaboratorEmails(collaboratorEmails);
    if (emails.length) {
      await this.inviteCollaboratorsByEmail(
        project.id,
        project.studioId,
        user,
        emails,
      );
    }

    return this.findOne(project.id, user);
  }

  private async syncProjectProgress(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        phase: true,
        projectCategory: true,
        phaseProgress: { select: { phase: true, progress: true } },
        checklistItems: { select: { status: true } },
      },
    });
    if (!project) return;

    const progress = computeOverallProgress(project);
    await this.prisma.project.update({
      where: { id: projectId },
      data: { progress },
    });
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    const existing = await this.prisma.project.findFirst({
      where: projectByIdWhere(this.access(user), id),
      select: { id: true, ownerId: true, visibility: true, phase: true },
    });
    if (!existing) throw new NotFoundException('Project not found');

    const dates = this.buildProjectDates(dto);
    const { visibility, progress: inPhaseProgress, ...rest } = dto;

    if (
      existing.visibility === ProjectVisibility.PERSONAL &&
      existing.ownerId !== user.id &&
      user.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Ce projet personnel ne peut être modifié que par son propriétaire');
    }

    const visibilityData =
      visibility !== undefined
        ? this.visibilityPayload(visibility, user.id)
        : {};

    const targetPhase = dto.phase ?? existing.phase;

    if (inPhaseProgress !== undefined) {
      await this.prisma.phaseProgress.upsert({
        where: {
          projectId_phase: { projectId: id, phase: targetPhase },
        },
        create: {
          projectId: id,
          phase: targetPhase,
          progress: Math.max(0, Math.min(100, Math.round(inPhaseProgress))),
        },
        update: {
          progress: Math.max(0, Math.min(100, Math.round(inPhaseProgress))),
        },
      });
    }

    await this.prisma.project.update({
      where: { id },
      data: {
        ...rest,
        ...visibilityData,
        ...dates,
      },
    });

    await this.syncProjectProgress(id);

    await this.activityLogs.log({
      userId: user.id,
      projectId: id,
      action: 'UPDATE',
      entity: 'Project',
      entityId: id,
    });
    return this.findOne(id, user);
  }

  async updateChecklistItem(
    projectId: string,
    itemId: string,
    dto: UpdateChecklistItemDto,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    await this.findOne(projectId, user);
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
        where: { id: item.documentId, studioId: user.studioId },
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
      userId: user.id,
      projectId,
      action: 'UPDATE',
      entity: 'ProjectChecklistItem',
      entityId: itemId,
    });

    await this.syncProjectProgress(projectId);

    return updated;
  }

  async setMainImageFromAsset(
    projectId: string,
    assetId: string,
    user: Pick<AuthUser, 'studioId' | 'id' | 'role'>,
  ) {
    await this.findOne(projectId, user);
    const asset = await this.plansRendersService.findOne(assetId, user.studioId);
    if (asset.projectId !== projectId) {
      await this.plansRendersService.update(
        assetId,
        { projectId },
        user.studioId,
        user.id,
      );
    }
    return this.plansRendersService.setMainImage(assetId, user.studioId, user.id);
  }

  async remove(id: string, user: Pick<AuthUser, 'studioId' | 'id' | 'role'>) {
    const project = await this.prisma.project.findFirst({
      where: projectByIdWhere(this.access(user), id),
      select: { id: true, studioId: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (user.role !== Role.OWNER) {
      throw new ForbiddenException(
        'Seul le propriétaire du cabinet peut supprimer un projet',
      );
    }

    if (!isProjectStudioMember(this.access(user), project.studioId)) {
      throw new ForbiddenException(
        'Seul le cabinet propriétaire peut supprimer ce projet',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.chantierLog.deleteMany({ where: { projectId: id } });
      await tx.task.deleteMany({ where: { projectId: id } });
      await tx.deadline.deleteMany({ where: { projectId: id } });
      await tx.meeting.deleteMany({ where: { projectId: id } });
      await tx.activityLog.deleteMany({ where: { projectId: id } });
      await tx.payment.updateMany({
        where: { projectId: id },
        data: { projectId: null },
      });
      await tx.invoice.updateMany({
        where: { projectId: id },
        data: { projectId: null },
      });
      await tx.devis.updateMany({
        where: { projectId: id },
        data: { projectId: null },
      });
      await tx.calendarEvent.updateMany({
        where: { projectId: id },
        data: { projectId: null },
      });
      await tx.project.delete({ where: { id } });
    });

    return { deleted: true };
  }

  async resolveLocation(query: ResolveLocationQueryDto) {
    if (query.latitude != null && query.longitude != null) {
      if (!isInMoroccoBounds(query.latitude, query.longitude)) {
        throw new BadRequestException(
          'Le point est hors du Maroc. Cliquez sur la carte au niveau du projet.',
        );
      }
      return resolveFromWgs84(query.latitude, query.longitude, query);
    }

    const result = await resolveMoroccoLocation(query);
    if (!result) {
      throw new BadRequestException(
        'Localisation introuvable. Indiquez au minimum la ville et l’adresse.',
      );
    }
    return result;
  }
}
