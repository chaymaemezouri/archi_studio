import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientStatus } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  enrichClientDetail,
  enrichClientSummary,
} from './clients.mapper';
import { CreateClientDocumentDto } from './dto/client-document.dto';
import {
  CreateClientNoteDto,
  UpdateClientNoteDto,
} from './dto/client-note.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { buildClientWriteData } from './client-write.util';

const listInclude = {
  _count: { select: { projects: true, devis: true, invoices: true } },
  projects: {
    select: { id: true, name: true, status: true, updatedAt: true },
  },
  devis: {
    select: { id: true, status: true, totalTTC: true, updatedAt: true },
  },
  invoices: {
    select: {
      id: true,
      status: true,
      totalTTC: true,
      paidAmount: true,
      updatedAt: true,
    },
  },
} as const;

const detailInclude = {
  projects: {
    orderBy: { updatedAt: 'desc' as const },
    include: {
      phaseProgress: true,
      deadlines: {
        where: { done: false },
        take: 1,
        orderBy: { date: 'asc' as const },
      },
    },
  },
  devis: {
    orderBy: { createdAt: 'desc' as const },
    include: { project: { select: { id: true, name: true } } },
  },
  invoices: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      project: { select: { id: true, name: true } },
      payments: { orderBy: { date: 'desc' as const } },
    },
  },
  clientNotes: { orderBy: { createdAt: 'desc' as const } },
  documents: { orderBy: { createdAt: 'desc' as const } },
  clientDocuments: { orderBy: { createdAt: 'desc' as const } },
  activityLogs: {
    orderBy: { createdAt: 'desc' as const },
    take: 100,
    include: { user: { select: { id: true, name: true } } },
  },
} as const;

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private activityLogs: ActivityLogsService,
    private documentsService: DocumentsService,
  ) {}

  async findAll(studioId: string) {
    const clients = await this.prisma.client.findMany({
      where: { studioId },
      include: listInclude,
      orderBy: { updatedAt: 'desc' },
    });
    return clients.map(enrichClientSummary);
  }

  async findOne(id: string, studioId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, studioId },
      include: detailInclude,
    });
    if (!client) throw new NotFoundException('Client not found');
    return enrichClientDetail(client);
  }

  async create(dto: CreateClientDto, studioId: string, userId?: string) {
    const client = await this.prisma.client.create({
      data: { ...buildClientWriteData(dto), studioId } as Parameters<
        typeof this.prisma.client.create
      >[0]['data'],
      include: listInclude,
    });
    await this.activityLogs.log({
      userId,
      clientId: client.id,
      action: 'created',
      entity: 'Client',
      entityId: client.id,
      details: { name: client.name },
    });
    return enrichClientSummary(client);
  }

  async update(
    id: string,
    dto: UpdateClientDto,
    studioId: string,
    userId?: string,
  ) {
    await this.findOne(id, studioId);
    const client = await this.prisma.client.update({
      where: { id },
      data: buildClientWriteData(dto) as Parameters<
        typeof this.prisma.client.update
      >[0]['data'],
      include: listInclude,
    });
    await this.activityLogs.log({
      userId,
      clientId: id,
      action: 'updated',
      entity: 'Client',
      entityId: id,
      details: { name: client.name },
    });
    return enrichClientSummary(client);
  }

  async archive(id: string, studioId: string, userId?: string) {
    await this.findOne(id, studioId);
    const client = await this.prisma.client.update({
      where: { id },
      data: { status: ClientStatus.ARCHIVED },
      include: listInclude,
    });
    await this.activityLogs.log({
      userId,
      clientId: id,
      action: 'archived',
      entity: 'Client',
      entityId: id,
    });
    return enrichClientSummary(client);
  }

  async remove(id: string, studioId: string) {
    await this.findOne(id, studioId);
    await this.prisma.client.delete({ where: { id } });
    return { deleted: true };
  }

  async createNote(
    clientId: string,
    dto: CreateClientNoteDto,
    studioId: string,
    userId?: string,
  ) {
    await this.findOne(clientId, studioId);
    const note = await this.prisma.clientNote.create({
      data: { clientId, content: dto.content },
    });
    await this.activityLogs.log({
      userId,
      clientId,
      action: 'note_added',
      entity: 'ClientNote',
      entityId: note.id,
    });
    return note;
  }

  async updateNote(
    clientId: string,
    noteId: string,
    dto: UpdateClientNoteDto,
    studioId: string,
    userId?: string,
  ) {
    await this.findOne(clientId, studioId);
    const note = await this.prisma.clientNote.findFirst({
      where: { id: noteId, clientId },
    });
    if (!note) throw new NotFoundException('Note not found');
    const updated = await this.prisma.clientNote.update({
      where: { id: noteId },
      data: { content: dto.content },
    });
    await this.activityLogs.log({
      userId,
      clientId,
      action: 'note_updated',
      entity: 'ClientNote',
      entityId: noteId,
    });
    return updated;
  }

  async removeNote(clientId: string, noteId: string, studioId: string) {
    await this.findOne(clientId, studioId);
    const note = await this.prisma.clientNote.findFirst({
      where: { id: noteId, clientId },
    });
    if (!note) throw new NotFoundException('Note not found');
    await this.prisma.clientNote.delete({ where: { id: noteId } });
    return { deleted: true };
  }

  async createDocument(
    clientId: string,
    dto: CreateClientDocumentDto,
    studioId: string,
    userId?: string,
  ) {
    await this.findOne(clientId, studioId);
    return this.documentsService.create(
      {
        name: dto.name,
        url: dto.url,
        mimeType: dto.mimeType,
        size: dto.size ?? 0,
        category: dto.docType ?? 'CLIENT_DOC',
        clientId,
      },
      studioId,
      userId,
    );
  }

  async removeDocument(
    clientId: string,
    docId: string,
    studioId: string,
    userId?: string,
  ) {
    await this.findOne(clientId, studioId);
    const doc = await this.prisma.document.findFirst({
      where: { id: docId, clientId, studioId },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return this.documentsService.remove(docId, studioId, userId);
  }
}
