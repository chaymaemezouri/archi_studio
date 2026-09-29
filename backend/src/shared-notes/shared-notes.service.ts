import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotifType } from '@prisma/client';
import { unlinkSync } from 'fs';
import { join } from 'path';
import type { AuthUser } from '../common/types/auth-user';
import { isNotificationTypeEnabled } from '../notifications/notification-preferences';
import { NotificationPreferencesService } from '../notifications/notification-preferences.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { SharedNoteFieldsDto } from './dto/shared-note.dto';

const noteInclude = {
  author: { select: { id: true, name: true } },
  files: { orderBy: { createdAt: 'asc' as const } },
  refs: { orderBy: { createdAt: 'asc' as const } },
};

const REF_KINDS = ['CLIENT', 'PROJECT', 'DOCUMENT', 'PLAN', 'RENDER'] as const;
type RefKind = (typeof REF_KINDS)[number];

@Injectable()
export class SharedNotesService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
    private notifications: NotificationsService,
    private notificationPreferences: NotificationPreferencesService,
  ) {}

  async findAll(user: Pick<AuthUser, 'studioId'>) {
    const notes = await this.prisma.sharedNote.findMany({
      where: { studioId: user.studioId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: noteInclude,
    });
    await this.ensureNotifications(notes);
    return notes;
  }

  async create(
    dto: SharedNoteFieldsDto,
    files: Express.Multer.File[] | undefined,
    user: Pick<AuthUser, 'id' | 'studioId'>,
  ) {
    const fields = this.cleanFields(dto);
    const uploads = files ?? [];
    const refs = await this.resolveRefs(user.studioId, dto.refs);
    if (!this.hasPayload(fields, uploads.length, refs.length)) {
      throw new BadRequestException(
        'Écrivez un message ou partagez un élément du cabinet.',
      );
    }

    const note = await this.prisma.sharedNote.create({
      data: {
        ...fields,
        studioId: user.studioId,
        authorId: user.id,
      },
    });

    if (refs.length) {
      await this.prisma.sharedNoteRef.createMany({
        data: refs.map((ref) => ({ ...ref, noteId: note.id })),
      });
    }

    if (uploads.length) {
      await this.attachFiles(note.id, user.studioId, uploads);
    }

    const created = await this.prisma.sharedNote.findUniqueOrThrow({
      where: { id: note.id },
      include: noteInclude,
    });
    await this.publish(created, true);
    return created;
  }

  async update(
    id: string,
    dto: SharedNoteFieldsDto,
    user: Pick<AuthUser, 'studioId'>,
  ) {
    const existing = await this.findOwned(id, user.studioId);
    const fields = this.cleanFields(dto);
    const fileCount = await this.prisma.sharedNoteFile.count({
      where: { noteId: existing.id },
    });
    if (!this.hasPayload(fields, fileCount)) {
      throw new BadRequestException(
        'La note doit garder un texte, un contact ou un fichier.',
      );
    }

    const updated = await this.prisma.sharedNote.update({
      where: { id: existing.id },
      data: fields,
      include: noteInclude,
    });
    await this.publish(updated, true);
    return updated;
  }

  async addFiles(
    id: string,
    files: Express.Multer.File[] | undefined,
    user: Pick<AuthUser, 'studioId'>,
  ) {
    const note = await this.findOwned(id, user.studioId);
    const uploads = files ?? [];
    if (!uploads.length) {
      throw new BadRequestException('Aucun fichier.');
    }
    const current = await this.prisma.sharedNoteFile.count({
      where: { noteId: note.id },
    });
    if (current + uploads.length > 8) {
      throw new BadRequestException('8 fichiers maximum par note.');
    }
    await this.attachFiles(note.id, user.studioId, uploads);
    const updated = await this.prisma.sharedNote.findUniqueOrThrow({
      where: { id: note.id },
      include: noteInclude,
    });
    await this.publish(updated, true);
    return updated;
  }

  async removeFile(noteId: string, fileId: string, user: Pick<AuthUser, 'studioId'>) {
    await this.findOwned(noteId, user.studioId);
    const file = await this.prisma.sharedNoteFile.findFirst({
      where: { id: fileId, noteId },
    });
    if (!file) throw new NotFoundException('Fichier introuvable');
    this.unlinkPublicFile(file.url);
    await this.prisma.sharedNoteFile.delete({ where: { id: file.id } });
    return { deleted: true };
  }

  async remove(id: string, user: Pick<AuthUser, 'studioId'>) {
    const note = await this.prisma.sharedNote.findFirst({
      where: { id, studioId: user.studioId },
      include: { files: true },
    });
    if (!note) throw new NotFoundException('Note introuvable');
    for (const file of note.files) this.unlinkPublicFile(file.url);
    await this.prisma.sharedNote.delete({ where: { id } });
    await this.prisma.notification.deleteMany({
      where: { uniqueKey: { startsWith: `shared-note:${id}:` } },
    });
    return { deleted: true };
  }

  private noteTitle(note: {
    content: string;
    contactName: string | null;
    files?: { id: string }[];
    refs?: { kind: string; title: string }[];
  }) {
    const ref = note.refs?.[0];
    if (ref && !note.content.trim()) {
      if (ref.kind === 'CLIENT') return 'Contact partagé';
      if (ref.kind === 'PROJECT') return 'Projet partagé';
      if (ref.kind === 'DOCUMENT') return 'Document partagé';
      if (ref.kind === 'PLAN') return 'Plan partagé';
      if (ref.kind === 'RENDER') return 'Image partagée';
    }
    if (note.contactName && !note.content.trim()) return 'Contact partagé';
    if ((note.files?.length ?? 0) > 0 && !note.content.trim() && !note.contactName) {
      return 'Fichier partagé';
    }
    return 'Note partagée';
  }

  private notePreview(note: {
    content: string;
    contactName: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    files?: { id: string }[];
    refs?: { title: string }[];
  }) {
    const text = note.content.trim();
    if (text) return text.length > 140 ? `${text.slice(0, 137)}…` : text;
    const shared = note.refs?.map((ref) => ref.title).filter(Boolean).join(', ');
    if (shared) return shared;
    const contact = [note.contactName, note.contactPhone, note.contactEmail]
      .filter(Boolean)
      .join(' · ');
    if (contact) return contact;
    const count = note.files?.length ?? 0;
    return count ? `${count} fichier${count > 1 ? 's' : ''}` : 'Nouveau partage';
  }

  private parseRefIds(raw?: string): { kind: RefKind; entityId: string }[] {
    if (!raw?.trim()) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BadRequestException('Partage invalide.');
    }
    if (!Array.isArray(parsed)) throw new BadRequestException('Partage invalide.');
    return parsed.slice(0, 8).map((item) => {
      const kind = (item as { kind?: string })?.kind;
      const entityId = (item as { entityId?: string })?.entityId?.trim();
      if (!kind || !(REF_KINDS as readonly string[]).includes(kind) || !entityId) {
        throw new BadRequestException('Partage invalide.');
      }
      return { kind: kind as RefKind, entityId };
    });
  }

  private async resolveRefs(studioId: string, raw?: string) {
    const items = this.parseRefIds(raw);
    const resolved: {
      kind: RefKind;
      entityId: string;
      title: string;
      subtitle: string | null;
      href: string;
      url: string | null;
    }[] = [];

    for (const item of items) {
      if (item.kind === 'CLIENT') {
        const row = await this.prisma.client.findFirst({
          where: { id: item.entityId, studioId },
          select: { id: true, name: true, phone: true, email: true },
        });
        if (!row) throw new BadRequestException('Contact introuvable.');
        resolved.push({
          kind: 'CLIENT',
          entityId: row.id,
          title: row.name,
          subtitle: [row.phone, row.email].filter(Boolean).join(' · ') || null,
          href: `/clients/${row.id}`,
          url: null,
        });
      } else if (item.kind === 'PROJECT') {
        const row = await this.prisma.project.findFirst({
          where: { id: item.entityId, studioId },
          select: { id: true, name: true, city: true },
        });
        if (!row) throw new BadRequestException('Projet introuvable.');
        resolved.push({
          kind: 'PROJECT',
          entityId: row.id,
          title: row.name,
          subtitle: row.city,
          href: `/projects/${row.id}`,
          url: null,
        });
      } else if (item.kind === 'DOCUMENT') {
        const row = await this.prisma.document.findFirst({
          where: { id: item.entityId, studioId },
          select: { id: true, name: true, type: true, url: true },
        });
        if (!row) throw new BadRequestException('Document introuvable.');
        resolved.push({
          kind: 'DOCUMENT',
          entityId: row.id,
          title: row.name,
          subtitle: row.type,
          href: '/documents',
          url: row.url,
        });
      } else {
        const row = await this.prisma.planRender.findFirst({
          where: { id: item.entityId, studioId, kind: item.kind },
          select: { id: true, name: true, url: true, kind: true },
        });
        if (!row) {
          throw new BadRequestException(
            item.kind === 'PLAN' ? 'Plan introuvable.' : 'Image introuvable.',
          );
        }
        resolved.push({
          kind: item.kind,
          entityId: row.id,
          title: row.name,
          subtitle: row.kind === 'PLAN' ? 'Plan' : 'Image',
          href: '/plans-renders',
          url: row.url,
        });
      }
    }

    return resolved;
  }

  private async publish(
    note: {
      id: string;
      studioId: string;
      content: string;
      contactName: string | null;
      contactPhone: string | null;
      contactEmail: string | null;
      files?: { id: string }[];
      author?: { name: string } | null;
    },
    refreshUnread: boolean,
  ) {
    const members = await this.prisma.user.findMany({
      where: { studioId: note.studioId },
      select: { id: true },
    });
    const title = this.noteTitle(note);
    const message = `${note.author?.name ?? 'Cabinet'} — ${this.notePreview(note)}`;
    await Promise.all(
      members.map(async (member) => {
        const prefs = await this.notificationPreferences.getForUser(member.id);
        if (!isNotificationTypeEnabled(prefs, NotifType.SHARED_NOTE)) return;
        await this.notifications.notifyUser(
          member.id,
          NotifType.SHARED_NOTE,
          title,
          message,
          `shared-note:${note.id}:${member.id}`,
          '/dashboard',
          { refreshUnread },
        );
      }),
    );
  }

  private async ensureNotifications(
    notes: {
      id: string;
      studioId: string;
      content: string;
      contactName: string | null;
      contactPhone: string | null;
      contactEmail: string | null;
      files?: { id: string }[];
      author?: { name: string } | null;
    }[],
  ) {
    if (!notes.length) return;
    const members = await this.prisma.user.findMany({
      where: { studioId: notes[0].studioId },
      select: { id: true },
    });
    const keys = notes.flatMap((note) =>
      members.map((member) => `shared-note:${note.id}:${member.id}`),
    );
    const existing = await this.prisma.notification.findMany({
      where: { uniqueKey: { in: keys } },
      select: { uniqueKey: true },
    });
    const have = new Set(existing.map((item) => item.uniqueKey));
    await Promise.all(
      notes.flatMap((note) =>
        members.map(async (member) => {
          const key = `shared-note:${note.id}:${member.id}`;
          if (have.has(key)) return;
          const prefs = await this.notificationPreferences.getForUser(member.id);
          if (!isNotificationTypeEnabled(prefs, NotifType.SHARED_NOTE)) return;
          await this.notifications.notifyUser(
            member.id,
            NotifType.SHARED_NOTE,
            this.noteTitle(note),
            `${note.author?.name ?? 'Cabinet'} — ${this.notePreview(note)}`,
            key,
            '/dashboard',
          );
        }),
      ),
    );
  }

  private async findOwned(id: string, studioId: string) {
    const note = await this.prisma.sharedNote.findFirst({
      where: { id, studioId },
    });
    if (!note) throw new NotFoundException('Note introuvable');
    return note;
  }

  private async attachFiles(
    noteId: string,
    studioId: string,
    files: Express.Multer.File[],
  ) {
    for (const file of files) {
      const saved = this.uploads.saveSharedNoteFile(file, studioId, noteId);
      await this.prisma.sharedNoteFile.create({
        data: { noteId, ...saved },
      });
    }
  }

  private cleanFields(dto: SharedNoteFieldsDto) {
    return {
      content: dto.content?.trim() ?? '',
      contactName: this.optionalText(dto.contactName),
      contactPhone: this.optionalText(dto.contactPhone),
      contactEmail: this.optionalText(dto.contactEmail),
    };
  }

  private optionalText(value?: string | null) {
    const text = value?.trim() ?? '';
    return text || null;
  }

  private hasPayload(
    fields: { content: string; contactName: string | null; contactPhone: string | null; contactEmail: string | null },
    fileCount: number,
    refCount = 0,
  ) {
    return (
      Boolean(fields.content) ||
      Boolean(fields.contactName) ||
      Boolean(fields.contactPhone) ||
      Boolean(fields.contactEmail) ||
      fileCount > 0 ||
      refCount > 0
    );
  }

  private unlinkPublicFile(url: string) {
    const prefix = '/api/uploads/files/';
    if (!url.startsWith(prefix)) return;
    const filePath = join(
      this.uploads.getUploadRoot(),
      ...url.slice(prefix.length).split('/'),
    );
    try {
      unlinkSync(filePath);
    } catch {
      /* fichier déjà absent */
    }
  }
}
